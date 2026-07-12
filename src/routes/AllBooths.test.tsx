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
                type: 'Standalone',
                availability: 'In Stock',
                msrp: '60',
                bgg_id: '266192',
                isFavorite: false,
                is_visited: false,
            },
            {
                id: 'b2',
                title: 'Wyrmspan',
                type: 'Expansion',
                availability: 'In Stock',
                msrp: '40',
                bgg_id: '397043',
                isFavorite: false,
                is_visited: false,
            },
        ],
    },
];

describe('AllBooths', () => {
    beforeEach(() => {
        mockUseGetAllBooths.mockReset();
        localStorage.clear();
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

    it('hides booths matching an excluded type', () => {
        localStorage.setItem(
            'booth-filters',
            JSON.stringify({
                excludedTypes: ['Expansion'],
                excludedAvailabilities: [],
                hideVisited: false,
            })
        );
        mockUseGetAllBooths.mockReturnValue({
            isLoading: false,
            error: null,
            data: publisherGroups,
        } as never);

        renderWithProviders(<AllBooths userId="user-1" />);

        expect(screen.getByRole('link', { name: 'Wingspan' })).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Wyrmspan' })).not.toBeInTheDocument();
    });

    it('shows a "no booths match" message when the filter excludes everything', () => {
        localStorage.setItem(
            'booth-filters',
            JSON.stringify({
                excludedTypes: ['Standalone', 'Expansion'],
                excludedAvailabilities: [],
                hideVisited: false,
            })
        );
        mockUseGetAllBooths.mockReturnValue({
            isLoading: false,
            error: null,
            data: publisherGroups,
        } as never);

        renderWithProviders(<AllBooths userId="user-1" />);

        expect(screen.getByText('No booths match your filters.')).toBeInTheDocument();
    });
});
