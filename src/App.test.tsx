import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';
import App from './App';
import { supabase } from './lib/supabase';

vi.mock('./lib/supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(),
            onAuthStateChange: vi.fn(),
        },
    },
}));

vi.mock('./components/AuthContainer', () => ({
    default: () => <div>auth-container</div>,
}));

vi.mock('./routes/AllBooths', () => ({
    default: ({ userId }: { userId: string }) => <div>all-booths:{userId}</div>,
}));

vi.mock('./routes/FavoriteBooths', () => ({
    default: ({ userId }: { userId: string }) => <div>favorite-booths:{userId}</div>,
}));

const unsubscribe = vi.fn();
let authStateCallback: ((event: AuthChangeEvent, session: Session | null) => void) | undefined;

function makeSession(userId: string): Session {
    return { user: { id: userId } } as unknown as Session;
}

describe('App', () => {
    beforeEach(() => {
        vi.mocked(supabase.auth.getSession).mockReset();
        vi.mocked(supabase.auth.onAuthStateChange).mockReset();
        unsubscribe.mockReset();
        authStateCallback = undefined;

        vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
            authStateCallback = callback;
            return { data: { subscription: { unsubscribe } } } as never;
        });
    });

    afterEach(() => {
        window.history.pushState({}, '', '/');
    });

    it('renders AuthContainer before the session resolves', () => {
        vi.mocked(supabase.auth.getSession).mockReturnValue(new Promise(() => {}) as never);

        render(<App />);

        expect(screen.getByText('auth-container')).toBeInTheDocument();
    });

    it('renders AuthContainer once getSession resolves with no session', async () => {
        vi.mocked(supabase.auth.getSession).mockResolvedValue({
            data: { session: null },
            error: null,
        } as never);

        render(<App />);

        await waitFor(() => expect(screen.getByText('auth-container')).toBeInTheDocument());
    });

    it('renders AllBooths at "/" with the session user id once a session resolves', async () => {
        vi.mocked(supabase.auth.getSession).mockResolvedValue({
            data: { session: makeSession('user-1') },
            error: null,
        } as never);

        render(<App />);

        expect(await screen.findByText('all-booths:user-1')).toBeInTheDocument();
    });

    it('renders FavoriteBooths at "/favorite-booths"', async () => {
        window.history.pushState({}, '', '/favorite-booths');
        vi.mocked(supabase.auth.getSession).mockResolvedValue({
            data: { session: makeSession('user-1') },
            error: null,
        } as never);

        render(<App />);

        expect(await screen.findByText('favorite-booths:user-1')).toBeInTheDocument();
    });

    it('switches from AuthContainer to the routed app when onAuthStateChange fires with a session', async () => {
        vi.mocked(supabase.auth.getSession).mockResolvedValue({
            data: { session: null },
            error: null,
        } as never);

        render(<App />);

        await waitFor(() => expect(screen.getByText('auth-container')).toBeInTheDocument());

        authStateCallback?.('SIGNED_IN', makeSession('user-2'));

        expect(await screen.findByText('all-booths:user-2')).toBeInTheDocument();
    });

    it('unsubscribes from auth state changes on unmount', async () => {
        vi.mocked(supabase.auth.getSession).mockResolvedValue({
            data: { session: null },
            error: null,
        } as never);

        const { unmount } = render(<App />);
        await waitFor(() => expect(screen.getByText('auth-container')).toBeInTheDocument());

        unmount();

        expect(unsubscribe).toHaveBeenCalled();
    });
});
