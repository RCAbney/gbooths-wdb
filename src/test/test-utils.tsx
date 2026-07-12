import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ViewProvider } from '../context/ViewContext';
import { FilterProvider } from '../context/FilterContext';

export function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false, gcTime: 0 },
            mutations: { retry: false },
        },
    });
}

export function createQueryClientWrapper(queryClient = createTestQueryClient()) {
    return function Wrapper({ children }: { children: ReactNode }) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
}

export function renderWithProviders(
    ui: ReactElement,
    options?: RenderOptions & { queryClient?: QueryClient }
) {
    const queryClient = options?.queryClient ?? createTestQueryClient();

    function AllProviders({ children }: { children: ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <ViewProvider>
                        <FilterProvider>{children}</FilterProvider>
                    </ViewProvider>
                </MemoryRouter>
            </QueryClientProvider>
        );
    }

    return { queryClient, ...render(ui, { wrapper: AllProviders, ...options }) };
}

// eslint-disable-next-line react-refresh/only-export-components -- test-only file, not part of the Fast Refresh module graph
export * from '@testing-library/react';
