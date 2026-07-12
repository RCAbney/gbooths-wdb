import { vi } from 'vitest';

interface QueryResult<T> {
    data: T;
    error: { message: string } | null;
}

/**
 * A minimal chainable stand-in for Supabase's PostgrestQueryBuilder. Every
 * chain method returns the same builder so calls can be composed in any
 * order the real client supports; the builder resolves to `result` when
 * awaited, matching Supabase's thenable query builder.
 */
export function createSupabaseQueryBuilder<T>(result: QueryResult<T>) {
    const builder: Record<string, unknown> = {
        select: vi.fn(() => builder),
        eq: vi.fn(() => builder),
        order: vi.fn(() => builder),
        upsert: vi.fn(() => builder),
        insert: vi.fn(() => Promise.resolve(result)),
        delete: vi.fn(() => builder),
        single: vi.fn(() => Promise.resolve(result)),
        returns: vi.fn(() => Promise.resolve(result)),
        then: (
            onFulfilled: (value: QueryResult<T>) => unknown,
            onRejected?: (reason: unknown) => unknown
        ) => Promise.resolve(result).then(onFulfilled, onRejected),
    };
    return builder;
}
