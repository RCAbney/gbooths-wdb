import type { BoothFilterState } from '../context/FilterContext';
import type { PublisherGroup } from '../types/booth';

export const filterBooths = (
    publisherGroups: PublisherGroup[],
    filters: BoothFilterState
): PublisherGroup[] => {
    const { excludedTypes, excludedAvailabilities, hideVisited } = filters;

    return publisherGroups
        .map((group) => ({
            ...group,
            titles: group.titles.filter((title) => {
                if (excludedTypes.has(title.type)) return false;
                if (excludedAvailabilities.has(title.availability)) return false;
                if (hideVisited && title.is_visited) return false;
                return true;
            }),
        }))
        .filter((group) => group.titles.length > 0);
};
