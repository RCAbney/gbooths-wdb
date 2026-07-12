import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilters } from './useFilters';
import { FilterProvider } from '../context/FilterContext';

describe('useFilters', () => {
    it('throws when used outside a FilterProvider', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => renderHook(() => useFilters())).toThrow(
            'useFilters must be used within a FilterProvider'
        );

        consoleError.mockRestore();
    });

    it('defaults to no filters applied and the sheet closed', () => {
        const { result } = renderHook(() => useFilters(), { wrapper: FilterProvider });

        expect(result.current.excludedTypes.size).toBe(0);
        expect(result.current.excludedAvailabilities.size).toBe(0);
        expect(result.current.hideVisited).toBe(false);
        expect(result.current.isFilterSheetOpen).toBe(false);
    });

    it('reads the initial filter selections from localStorage', () => {
        localStorage.setItem(
            'booth-filters',
            JSON.stringify({
                excludedTypes: ['Expansion'],
                excludedAvailabilities: [],
                hideVisited: true,
            })
        );

        const { result } = renderHook(() => useFilters(), { wrapper: FilterProvider });

        expect(result.current.excludedTypes.has('Expansion')).toBe(true);
        expect(result.current.hideVisited).toBe(true);
    });

    it('toggleType adds/removes a value from excludedTypes and persists it', () => {
        const { result } = renderHook(() => useFilters(), { wrapper: FilterProvider });

        act(() => {
            result.current.toggleType('Expansion');
        });

        expect(result.current.excludedTypes.has('Expansion')).toBe(true);
        expect(JSON.parse(localStorage.getItem('booth-filters') ?? 'null').excludedTypes).toEqual([
            'Expansion',
        ]);

        act(() => {
            result.current.toggleType('Expansion');
        });

        expect(result.current.excludedTypes.has('Expansion')).toBe(false);
    });

    it('toggleAvailability adds/removes a value from excludedAvailabilities', () => {
        const { result } = renderHook(() => useFilters(), { wrapper: FilterProvider });

        act(() => {
            result.current.toggleAvailability('Demo');
        });

        expect(result.current.excludedAvailabilities.has('Demo')).toBe(true);

        act(() => {
            result.current.toggleAvailability('Demo');
        });

        expect(result.current.excludedAvailabilities.has('Demo')).toBe(false);
    });

    it('toggleHideVisited flips hideVisited', () => {
        const { result } = renderHook(() => useFilters(), { wrapper: FilterProvider });

        act(() => {
            result.current.toggleHideVisited();
        });

        expect(result.current.hideVisited).toBe(true);
    });

    it('openFilterSheet/closeFilterSheet toggle isFilterSheetOpen without touching localStorage', () => {
        const { result } = renderHook(() => useFilters(), { wrapper: FilterProvider });
        const persistedBeforeOpen = localStorage.getItem('booth-filters');

        act(() => {
            result.current.openFilterSheet();
        });
        expect(result.current.isFilterSheetOpen).toBe(true);
        expect(localStorage.getItem('booth-filters')).toBe(persistedBeforeOpen);

        act(() => {
            result.current.closeFilterSheet();
        });
        expect(result.current.isFilterSheetOpen).toBe(false);
    });

    it('clearFilters resets all filter selections', () => {
        const { result } = renderHook(() => useFilters(), { wrapper: FilterProvider });

        act(() => {
            result.current.toggleType('Expansion');
            result.current.toggleAvailability('Demo');
            result.current.toggleHideVisited();
        });

        act(() => {
            result.current.clearFilters();
        });

        expect(result.current.excludedTypes.size).toBe(0);
        expect(result.current.excludedAvailabilities.size).toBe(0);
        expect(result.current.hideVisited).toBe(false);
    });
});
