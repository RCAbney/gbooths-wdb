import { describe, it, expect } from 'vitest';
import { filterBooths } from './filterBooths';
import type { PublisherGroup } from '../types/booth';
import type { BoothFilterState } from '../context/FilterContext';

const noFilters: BoothFilterState = {
    excludedTypes: new Set(),
    excludedAvailabilities: new Set(),
    hideVisited: false,
};

const publisherGroups: PublisherGroup[] = [
    {
        publisher: 'Stonemaier',
        location: '101',
        titles: [
            {
                id: 'b1',
                title: 'Wingspan',
                type: 'Standalone',
                availability: 'For Sale',
                msrp: '60',
                bgg_id: '266192',
                isFavorite: false,
                is_visited: false,
            },
            {
                id: 'b2',
                title: 'Wyrmspan',
                type: 'Expansion',
                availability: 'Demo',
                msrp: '40',
                bgg_id: '397043',
                isFavorite: false,
                is_visited: true,
            },
        ],
    },
    {
        publisher: 'Weird City Games',
        location: 'USA',
        titles: [
            {
                id: 'b3',
                title: 'March of the Ants',
                type: 'Standalone',
                availability: 'For Sale',
                msrp: '60',
                bgg_id: '416079',
                isFavorite: false,
                is_visited: false,
            },
        ],
    },
];

describe('filterBooths', () => {
    it('returns everything unchanged when no filters are applied', () => {
        expect(filterBooths(publisherGroups, noFilters)).toEqual(publisherGroups);
    });

    it('excludes titles matching an excluded type', () => {
        const result = filterBooths(publisherGroups, {
            ...noFilters,
            excludedTypes: new Set(['Expansion']),
        });

        expect(result[0].titles.map((t) => t.id)).toEqual(['b1']);
        expect(result[1].titles.map((t) => t.id)).toEqual(['b3']);
    });

    it('excludes titles matching an excluded availability', () => {
        const result = filterBooths(publisherGroups, {
            ...noFilters,
            excludedAvailabilities: new Set(['Demo']),
        });

        expect(result[0].titles.map((t) => t.id)).toEqual(['b1']);
    });

    it('hides visited titles when hideVisited is true', () => {
        const result = filterBooths(publisherGroups, { ...noFilters, hideVisited: true });

        expect(result[0].titles.map((t) => t.id)).toEqual(['b1']);
    });

    it('drops a publisher group entirely once all its titles are filtered out', () => {
        const result = filterBooths(publisherGroups, {
            ...noFilters,
            excludedTypes: new Set(['Standalone']),
        });

        // b1 (Standalone) and b3 (Standalone) are excluded; only b2 (Expansion) remains
        expect(result).toHaveLength(1);
        expect(result[0].publisher).toBe('Stonemaier');
        expect(result[0].titles.map((t) => t.id)).toEqual(['b2']);
    });

    it('combines multiple filter dimensions', () => {
        const result = filterBooths(publisherGroups, {
            excludedTypes: new Set(['Expansion']),
            excludedAvailabilities: new Set(),
            hideVisited: false,
        });

        expect(result.flatMap((g) => g.titles.map((t) => t.id))).toEqual(['b1', 'b3']);
    });
});
