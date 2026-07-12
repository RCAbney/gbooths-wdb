import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/test-utils';
import AllBooths from './AllBooths';
import { useGetAllBooths } from '../queryHooks/useGetAllBooths';
import type { PublisherGroup } from '../types/booth';

// AllBooths renders real <Booth> children, which themselves pull mutation
// hooks from this module -- stub those out too so Booth mounts cleanly,
// same approach as Booth.test.tsx.
vi.mock('../queryHooks/useGetAllBooths', () => ({
    useGetAllBooths: vi.fn(),
    useAddIsVisited: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useRemoveIsVisited: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useAddToFavorites: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useRemoveFromFavorites: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

const mockUseGetAllBooths = vi.mocked(useGetAllBooths);

const publisherGroups: PublisherGroup[] = [
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
                isFavorite: false,
                is_visited: false,
            },
        ],
    },
];

describe('AllBooths', () => {
    beforeEach(() => {
        mockUseGetAllBooths.mockReset();
    });

    it('renders Loading while the query is pending', () => {
        mockUseGetAllBooths.mockReturnValue({
            isLoading: true,
            error: null,
            data: undefined,
        } as never);

        renderWithProviders(<AllBooths userId="user-1" />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders an error message when the query fails', () => {
        mockUseGetAllBooths.mockReturnValue({
            isLoading: false,
            error: new Error('boom'),
            data: undefined,
        } as never);

        renderWithProviders(<AllBooths userId="user-1" />);

        expect(screen.getByText('Error: boom')).toBeInTheDocument();
    });

    it('renders publisher groups and their booths, passing userId through', () => {
        mockUseGetAllBooths.mockReturnValue({
            isLoading: false,
            error: null,
            data: publisherGroups,
        } as never);

        renderWithProviders(<AllBooths userId="user-1" />);

        expect(screen.getByText('Stonemaier #101')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Wingspan' })).toHaveAttribute(
            'href',
            'https://boardgamegeek.com/boardgame/266192'
        );
    });
});
