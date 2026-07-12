import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/test-utils';
import FavoriteBooths from './FavoriteBooths';
import { useFavorites } from '../queryHooks/useGetAllBooths';
import type { PublisherGroup } from '../types/booth';

vi.mock('../queryHooks/useGetAllBooths', () => ({
    useFavorites: vi.fn(),
    useAddIsVisited: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useRemoveIsVisited: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useAddToFavorites: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useRemoveFromFavorites: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

const mockUseFavorites = vi.mocked(useFavorites);

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
                isFavorite: true,
                is_visited: false,
            },
        ],
    },
];

describe('FavoriteBooths', () => {
    beforeEach(() => {
        mockUseFavorites.mockReset();
    });

    it('renders Loading while the query is pending', () => {
        mockUseFavorites.mockReturnValue({
            isLoading: true,
            error: null,
            data: undefined,
        } as never);

        renderWithProviders(<FavoriteBooths userId="user-1" />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders an error message when the query fails', () => {
        mockUseFavorites.mockReturnValue({
            isLoading: false,
            error: new Error('boom'),
            data: undefined,
        } as never);

        renderWithProviders(<FavoriteBooths userId="user-1" />);

        expect(screen.getByText('Error: boom')).toBeInTheDocument();
    });

    it('renders NoBooths when there are no favorites', () => {
        mockUseFavorites.mockReturnValue({ isLoading: false, error: null, data: [] } as never);

        renderWithProviders(<FavoriteBooths userId="user-1" />);

        expect(
            screen.getByText('It doesn’t look like you’ve added any booths to visit yet.')
        ).toBeInTheDocument();
    });

    it('renders publisher groups and their booths when favorites exist', () => {
        mockUseFavorites.mockReturnValue({
            isLoading: false,
            error: null,
            data: publisherGroups,
        } as never);

        renderWithProviders(<FavoriteBooths userId="user-1" />);

        expect(screen.getByText('Stonemaier #101')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Wingspan' })).toHaveAttribute(
            'href',
            'https://boardgamegeek.com/boardgame/266192'
        );
    });

    it('shows a visited count across all publisher groups', () => {
        const mixedGroups: PublisherGroup[] = [
            {
                publisher: 'Stonemaier',
                location: '101',
                titles: [
                    { ...publisherGroups[0].titles[0], id: 'b1', is_visited: true },
                    { ...publisherGroups[0].titles[0], id: 'b2', is_visited: false },
                ],
            },
            {
                publisher: 'Weird City Games',
                location: '200',
                titles: [{ ...publisherGroups[0].titles[0], id: 'b3', is_visited: true }],
            },
        ];
        mockUseFavorites.mockReturnValue({
            isLoading: false,
            error: null,
            data: mixedGroups,
        } as never);

        renderWithProviders(<FavoriteBooths userId="user-1" />);

        expect(screen.getByText('2 of 3 visited')).toBeInTheDocument();
    });

    it('does not show a visited count when there are no favorites', () => {
        mockUseFavorites.mockReturnValue({ isLoading: false, error: null, data: [] } as never);

        renderWithProviders(<FavoriteBooths userId="user-1" />);

        expect(screen.queryByText(/visited$/)).not.toBeInTheDocument();
    });
});
