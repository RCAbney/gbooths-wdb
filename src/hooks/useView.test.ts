import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useView } from './useView';
import { ViewProvider } from '../context/ViewContext';

describe('useView', () => {
    it('throws when used outside a ViewProvider', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => renderHook(() => useView())).toThrow(
            'useView must be used within a ViewProvider'
        );

        consoleError.mockRestore();
    });

    it('defaults to showPublisher: true when localStorage is empty', () => {
        const { result } = renderHook(() => useView(), { wrapper: ViewProvider });

        expect(result.current.showPublisher).toBe(true);
    });

    it('reads the initial value from localStorage', () => {
        localStorage.setItem('view-preference', JSON.stringify(false));

        const { result } = renderHook(() => useView(), { wrapper: ViewProvider });

        expect(result.current.showPublisher).toBe(false);
    });

    it('toggleView flips state and persists the new value to localStorage', () => {
        const { result } = renderHook(() => useView(), { wrapper: ViewProvider });

        act(() => {
            result.current.toggleView();
        });

        expect(result.current.showPublisher).toBe(false);
        expect(JSON.parse(localStorage.getItem('view-preference') ?? 'null')).toBe(false);

        act(() => {
            result.current.toggleView();
        });

        expect(result.current.showPublisher).toBe(true);
        expect(JSON.parse(localStorage.getItem('view-preference') ?? 'null')).toBe(true);
    });
});
