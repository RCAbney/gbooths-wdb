import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Booth from './Booth';
import type { BoothTitle } from '../types/booth';

const mutateAsyncAddVisited = vi.fn();
const mutateAsyncRemoveVisited = vi.fn();
const mutateAsyncAddFavorite = vi.fn();
const mutateAsyncRemoveFavorite = vi.fn();

vi.mock('../queryHooks/useGetAllBooths', () => ({
    useAddIsVisited: () => ({ mutateAsync: mutateAsyncAddVisited, isPending: false }),
    useRemoveIsVisited: () => ({ mutateAsync: mutateAsyncRemoveVisited, isPending: false }),
    useAddToFavorites: () => ({ mutateAsync: mutateAsyncAddFavorite, isPending: false }),
    useRemoveFromFavorites: () => ({ mutateAsync: mutateAsyncRemoveFavorite, isPending: false }),
}));

const baseTitle: BoothTitle = {
    id: 'booth-1',
    title: 'Wingspan',
    bgg_id: '266192',
    availability: 'In Stock',
    msrp: '60',
    isFavorite: false,
    is_visited: false,
};

describe('Booth', () => {
    beforeEach(() => {
        mutateAsyncAddVisited.mockReset();
        mutateAsyncRemoveVisited.mockReset();
        mutateAsyncAddFavorite.mockReset();
        mutateAsyncRemoveFavorite.mockReset();
    });

    it('renders the title as a link to BoardGameGeek using bgg_id', () => {
        render(<Booth title={baseTitle} userId="user-1" />);

        expect(screen.getByRole('link', { name: 'Wingspan' })).toHaveAttribute(
            'href',
            'https://boardgamegeek.com/boardgame/266192'
        );
    });

    it('renders availability and a formatted price', () => {
        render(<Booth title={baseTitle} userId="user-1" />);

        expect(screen.getByText('In Stock - $60')).toBeInTheDocument();
    });

    it('does not prefix "N/A" msrp with a dollar sign', () => {
        render(<Booth title={{ ...baseTitle, msrp: 'N/A' }} userId="user-1" />);

        expect(screen.getByText('In Stock - N/A')).toBeInTheDocument();
    });

    it('calls useAddIsVisited when marking an unvisited booth as visited', async () => {
        const user = userEvent.setup();
        render(<Booth title={baseTitle} userId="user-1" />);

        const [visitedButton] = screen.getAllByRole('button');
        await user.click(visitedButton);

        expect(mutateAsyncAddVisited).toHaveBeenCalledWith({
            userId: 'user-1',
            boothId: 'booth-1',
            title: 'Wingspan',
        });
        expect(mutateAsyncRemoveVisited).not.toHaveBeenCalled();
    });

    it('calls useRemoveIsVisited when marking an already-visited booth as unvisited', async () => {
        const user = userEvent.setup();
        render(<Booth title={{ ...baseTitle, is_visited: true }} userId="user-1" />);

        const [visitedButton] = screen.getAllByRole('button');
        await user.click(visitedButton);

        expect(mutateAsyncRemoveVisited).toHaveBeenCalledWith({
            userId: 'user-1',
            boothId: 'booth-1',
            title: 'Wingspan',
        });
        expect(mutateAsyncAddVisited).not.toHaveBeenCalled();
    });

    it('calls useAddToFavorites when favoriting a booth that is not yet a favorite', async () => {
        const user = userEvent.setup();
        render(<Booth title={baseTitle} userId="user-1" />);

        const [, favoriteButton] = screen.getAllByRole('button');
        await user.click(favoriteButton);

        expect(mutateAsyncAddFavorite).toHaveBeenCalledWith({
            userId: 'user-1',
            boothId: 'booth-1',
            title: 'Wingspan',
        });
        expect(mutateAsyncRemoveFavorite).not.toHaveBeenCalled();
    });

    it('calls useRemoveFromFavorites when un-favoriting an already-favorited booth', async () => {
        const user = userEvent.setup();
        render(<Booth title={{ ...baseTitle, isFavorite: true }} userId="user-1" />);

        const [, favoriteButton] = screen.getAllByRole('button');
        await user.click(favoriteButton);

        expect(mutateAsyncRemoveFavorite).toHaveBeenCalledWith({
            userId: 'user-1',
            boothId: 'booth-1',
            title: 'Wingspan',
        });
        expect(mutateAsyncAddFavorite).not.toHaveBeenCalled();
    });
});
