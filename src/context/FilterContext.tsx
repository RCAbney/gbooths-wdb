import { createContext, useState, useEffect, type ReactNode } from 'react';

export interface BoothFilterState {
    excludedTypes: Set<string>;
    excludedAvailabilities: Set<string>;
    hideVisited: boolean;
}

export interface FilterContextValue extends BoothFilterState {
    isFilterSheetOpen: boolean;
    toggleType: (type: string) => void;
    toggleAvailability: (availability: string) => void;
    toggleHideVisited: () => void;
    openFilterSheet: () => void;
    closeFilterSheet: () => void;
    clearFilters: () => void;
}

const STORAGE_KEY = 'booth-filters';

interface StoredFilters {
    excludedTypes: string[];
    excludedAvailabilities: string[];
    hideVisited: boolean;
}

function loadStoredFilters(): BoothFilterState {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) {
        return { excludedTypes: new Set(), excludedAvailabilities: new Set(), hideVisited: false };
    }
    const parsed: StoredFilters = JSON.parse(saved);
    return {
        excludedTypes: new Set(parsed.excludedTypes),
        excludedAvailabilities: new Set(parsed.excludedAvailabilities),
        hideVisited: parsed.hideVisited,
    };
}

function toggleInSet(set: Set<string>, value: string): Set<string> {
    const next = new Set(set);
    if (next.has(value)) {
        next.delete(value);
    } else {
        next.add(value);
    }
    return next;
}

const FilterContext = createContext<FilterContextValue | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
    const [filters, setFilters] = useState<BoothFilterState>(() => loadStoredFilters());
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

    // Persist filter selections (but not sheet open/closed state) whenever they change
    useEffect(() => {
        const toStore: StoredFilters = {
            excludedTypes: [...filters.excludedTypes],
            excludedAvailabilities: [...filters.excludedAvailabilities],
            hideVisited: filters.hideVisited,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    }, [filters]);

    const toggleType = (type: string) => {
        setFilters((prev) => ({ ...prev, excludedTypes: toggleInSet(prev.excludedTypes, type) }));
    };

    const toggleAvailability = (availability: string) => {
        setFilters((prev) => ({
            ...prev,
            excludedAvailabilities: toggleInSet(prev.excludedAvailabilities, availability),
        }));
    };

    const toggleHideVisited = () => {
        setFilters((prev) => ({ ...prev, hideVisited: !prev.hideVisited }));
    };

    const clearFilters = () => {
        setFilters({
            excludedTypes: new Set(),
            excludedAvailabilities: new Set(),
            hideVisited: false,
        });
    };

    return (
        <FilterContext.Provider
            value={{
                ...filters,
                isFilterSheetOpen,
                toggleType,
                toggleAvailability,
                toggleHideVisited,
                openFilterSheet: () => setIsFilterSheetOpen(true),
                closeFilterSheet: () => setIsFilterSheetOpen(false),
                clearFilters,
            }}
        >
            {children}
        </FilterContext.Provider>
    );
}

export { FilterContext };
