import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import {
    useGetAllBooths,
    useFavorites,
    useAddIsVisited,
    useRemoveIsVisited,
    useAddToFavorites,
    useRemoveFromFavorites,
} from './useGetAllBooths';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import { createSupabaseQueryBuilder } from '../test/supabaseMock';
import { createTestQueryClient, createQueryClientWrapper } from '../test/test-utils';
import type { PublisherGroup } from '../types/booth';

vi.mock('../lib/supabase', () => ({
    supabase: {
        from: vi.fn(),
    },
}));

vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const mockFrom = vi.mocked(supabase.from);

describe('useGetAllBooths', () => {
    beforeEach(() => {
        mockFrom.mockReset();
    });

    it('groups booths by publisher and marks favorite/visited status', async () => {
        mockFrom.mockImplementation((table: string) => {
            if (table === 'booths') {
                return createSupabaseQueryBuilder({
                    data: [
                        {
                            id: 'b1',
                            title: 'Wingspan',
                            publisher: 'Stonemaier',
                            location: '101',
                            availability: 'In Stock',
                            msrp: '60',
                            bgg_id: '266192',
                        },
                        {
                            id: 'b2',
                            title: 'Scythe',
                            publisher: 'Stonemaier',
                            location: '101',
                            availability: 'Low Stock',
                            msrp: '80',
                            bgg_id: '169786',
                        },
                    ],
                    error: null,
                }) as never;
            }
            return createSupabaseQueryBuilder({
                data: [{ booth_id: 'b1', is_visited: true }],
                error: null,
            }) as never;
        });

        const { result } = renderHook(() => useGetAllBooths('user-1'), {
            wrapper: createQueryClientWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual([
            {
                publisher: 'Stonemaier',
                location: '101',
                titles: [
                    {
                        id: 'b1',
                        title: 'Wingspan',
                        availability: 'In Stock',
                        msrp: '60',
                        bgg_id: '266192',
                        isFavorite: true,
                        is_visited: true,
                    },
                    {
                        id: 'b2',
                        title: 'Scythe',
                        availability: 'Low Stock',
                        msrp: '80',
                        bgg_id: '169786',
                        isFavorite: false,
                        is_visited: false,
                    },
                ],
            },
        ]);
    });

    it('surfaces a Supabase error as a thrown query error', async () => {
        mockFrom.mockReturnValue(
            createSupabaseQueryBuilder({
                data: null,
                error: { message: 'connection failed' },
            }) as never
        );

        const { result } = renderHook(() => useGetAllBooths('user-1'), {
            wrapper: createQueryClientWrapper(),
        });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.error?.message).toBe('connection failed');
    });
});

describe('useFavorites', () => {
    beforeEach(() => {
        mockFrom.mockReset();
    });

    it('groups the joined favorites/booths rows by publisher, sorted alphabetically', async () => {
        mockFrom.mockReturnValue(
            createSupabaseQueryBuilder({
                data: [
                    {
                        booths: {
                            id: 'b2',
                            title: 'Scythe',
                            publisher: 'Stonemaier',
                            location: '101',
                            availability: 'Low Stock',
                            msrp: '80',
                            bgg_id: '169786',
                        },
                        is_visited: false,
                    },
                    {
                        booths: {
                            id: 'b1',
                            title: 'Wingspan',
                            publisher: 'Stonemaier',
                            location: '101',
                            availability: 'In Stock',
                            msrp: '60',
                            bgg_id: '266192',
                        },
                        is_visited: true,
                    },
                ],
                error: null,
            }) as never
        );

        const { result } = renderHook(() => useFavorites('user-1'), {
            wrapper: createQueryClientWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data?.[0].titles.map((t) => t.title)).toEqual(['Scythe', 'Wingspan']);
        expect(result.current.data?.[0].titles.every((t) => t.isFavorite)).toBe(true);
    });
});

describe('useAddIsVisited', () => {
    beforeEach(() => {
        mockFrom.mockReset();
        vi.mocked(toast.success).mockReset();
        vi.mocked(toast.error).mockReset();
    });

    it('upserts is_visited: true and shows a success toast', async () => {
        mockFrom.mockReturnValue(
            createSupabaseQueryBuilder({ data: { title: 'Wingspan' }, error: null }) as never
        );
        const queryClient = createTestQueryClient();

        const { result } = renderHook(() => useAddIsVisited(), {
            wrapper: createQueryClientWrapper(queryClient),
        });

        result.current.mutate({ userId: 'user-1', boothId: 'b1', title: 'Wingspan' });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockFrom).toHaveBeenCalledWith('favorites');
        expect(toast.success).toHaveBeenCalledWith(
            'Marked "Wingspan" as visited',
            expect.objectContaining({ position: 'top-center' })
        );
    });

    it('optimistically updates only the targeted booth when another booth shares its title', async () => {
        // Regression test: onMutate used to match by title, which meant two
        // booths with the same title (real scenario in this year's dataset,
        // e.g. "Machi Koro: Life" listed twice under different publishers)
        // would both flip to visited even though only one was toggled.
        mockFrom.mockReturnValue(
            createSupabaseQueryBuilder({
                data: { title: 'Machi Koro: Life' },
                error: null,
            }) as never
        );
        const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
        const initialData: PublisherGroup[] = [
            {
                publisher: 'Pandasaurus Games',
                location: 'Booth #215',
                titles: [
                    {
                        id: 'b1',
                        title: 'Machi Koro: Life',
                        type: 'Standalone',
                        availability: 'For Sale',
                        msrp: '30',
                        bgg_id: '421611',
                        isFavorite: false,
                        is_visited: false,
                    },
                ],
            },
            {
                publisher: 'Some Other Publisher',
                location: null,
                titles: [
                    {
                        id: 'b2',
                        title: 'Machi Koro: Life',
                        type: 'Standalone',
                        availability: 'For Sale',
                        msrp: '30',
                        bgg_id: '999999',
                        isFavorite: false,
                        is_visited: false,
                    },
                ],
            },
        ];
        queryClient.setQueryData(['booths', 'user-1'], initialData);

        const { result } = renderHook(() => useAddIsVisited(), {
            wrapper: createQueryClientWrapper(queryClient),
        });

        result.current.mutate({ userId: 'user-1', boothId: 'b1', title: 'Machi Koro: Life' });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        const cached = queryClient.getQueryData<PublisherGroup[]>(['booths', 'user-1']);
        expect(cached?.[0].titles[0].is_visited).toBe(true); // b1, the one actually toggled
        expect(cached?.[1].titles[0].is_visited).toBe(false); // b2, same title, untouched
    });

    it('optimistically marks the booth as visited, then rolls back on error', async () => {
        // Delay the rejection past a macrotask boundary -- otherwise onMutate's
        // optimistic write and onError's rollback both resolve within the same
        // microtask flush, and the intermediate state is never observable via
        // waitFor's (macrotask-based) polling.
        const builder: Record<string, unknown> = {
            upsert: vi.fn(() => builder),
            select: vi.fn(() => builder),
            single: vi.fn(
                () =>
                    new Promise((resolve) =>
                        setTimeout(
                            () => resolve({ data: null, error: { message: 'upsert failed' } }),
                            100
                        )
                    )
            ),
        };
        mockFrom.mockReturnValue(builder as never);
        // No useQuery observer is active for this key in this test (only the
        // mutation hook is rendered), so gcTime: 0 (from createTestQueryClient)
        // would garbage-collect the manually-seeded data before we can observe
        // it -- use a client with default gcTime instead.
        const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
        const initialData: PublisherGroup[] = [
            {
                publisher: 'Stonemaier',
                location: '101',
                titles: [
                    {
                        id: 'b1',
                        title: 'Wingspan',
                        type: 'Standalone',
                        availability: 'In Stock',
                        msrp: '60',
                        bgg_id: '266192',
                        isFavorite: false,
                        is_visited: false,
                    },
                ],
            },
        ];
        queryClient.setQueryData(['booths', 'user-1'], initialData);

        const { result } = renderHook(() => useAddIsVisited(), {
            wrapper: createQueryClientWrapper(queryClient),
        });

        result.current.mutate({ userId: 'user-1', boothId: 'b1', title: 'Wingspan' });

        // optimistic update applied before the mutation settles -- poll tightly
        // since the window before the 100ms delayed rejection is short-lived
        await waitFor(
            () =>
                expect(
                    queryClient.getQueryData<PublisherGroup[]>(['booths', 'user-1'])?.[0].titles[0]
                        .is_visited
                ).toBe(true),
            { interval: 5, timeout: 90 }
        );

        await waitFor(() => expect(result.current.isError).toBe(true));

        // rolled back to the pre-mutation state
        expect(
            queryClient.getQueryData<PublisherGroup[]>(['booths', 'user-1'])?.[0].titles[0]
                .is_visited
        ).toBe(false);
        expect(toast.error).toHaveBeenCalledWith(
            'Error marking as visited: Failed to mark as visited: upsert failed',
            expect.objectContaining({ position: 'top-center' })
        );
    });
});

describe('useRemoveIsVisited', () => {
    beforeEach(() => {
        mockFrom.mockReset();
        vi.mocked(toast.success).mockReset();
    });

    it('upserts is_visited: false and shows a success toast', async () => {
        mockFrom.mockReturnValue(
            createSupabaseQueryBuilder({ data: { title: 'Wingspan' }, error: null }) as never
        );

        const { result } = renderHook(() => useRemoveIsVisited(), {
            wrapper: createQueryClientWrapper(),
        });

        result.current.mutate({ userId: 'user-1', boothId: 'b1', title: 'Wingspan' });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(toast.success).toHaveBeenCalledWith(
            'Marked "Wingspan" as not visited',
            expect.objectContaining({ position: 'top-center' })
        );
    });
});

describe('useAddToFavorites', () => {
    beforeEach(() => {
        mockFrom.mockReset();
        vi.mocked(toast.success).mockReset();
        vi.mocked(toast.error).mockReset();
    });

    it('inserts a favorites row and shows a success toast', async () => {
        mockFrom.mockReturnValue(createSupabaseQueryBuilder({ data: null, error: null }) as never);
        const queryClient = createTestQueryClient();
        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useAddToFavorites(), {
            wrapper: createQueryClientWrapper(queryClient),
        });

        result.current.mutate({ userId: 'user-1', boothId: 'b1', title: 'Wingspan' });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockFrom).toHaveBeenCalledWith('favorites');
        expect(toast.success).toHaveBeenCalledWith(
            'Added "Wingspan" to favorites!',
            expect.objectContaining({ position: 'top-center' })
        );
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['favorites'] });
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['booths'] });
    });

    it('shows an error toast when the insert fails', async () => {
        mockFrom.mockReturnValue(
            createSupabaseQueryBuilder({ data: null, error: { message: 'insert failed' } }) as never
        );

        const { result } = renderHook(() => useAddToFavorites(), {
            wrapper: createQueryClientWrapper(),
        });

        result.current.mutate({ userId: 'user-1', boothId: 'b1', title: 'Wingspan' });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(toast.error).toHaveBeenCalledWith(
            'Error adding to favorites: insert failed',
            expect.objectContaining({ position: 'top-center' })
        );
    });
});

describe('useRemoveFromFavorites', () => {
    beforeEach(() => {
        mockFrom.mockReset();
        vi.mocked(toast.success).mockReset();
    });

    it('deletes the favorites row and shows a success toast', async () => {
        mockFrom.mockReturnValue(createSupabaseQueryBuilder({ data: null, error: null }) as never);

        const { result } = renderHook(() => useRemoveFromFavorites(), {
            wrapper: createQueryClientWrapper(),
        });

        result.current.mutate({ userId: 'user-1', boothId: 'b1', title: 'Wingspan' });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockFrom).toHaveBeenCalledWith('favorites');
        expect(toast.success).toHaveBeenCalledWith(
            'Removed "Wingspan" from favorites',
            expect.objectContaining({ position: 'top-center' })
        );
    });
});
