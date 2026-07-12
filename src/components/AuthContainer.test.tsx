import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthContainer from './AuthContainer';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
    supabase: {
        auth: {
            signInWithOtp: vi.fn(),
        },
    },
}));

describe('AuthContainer', () => {
    beforeEach(() => {
        vi.mocked(supabase.auth.signInWithOtp).mockReset();
    });

    it('updates the email input as the user types', async () => {
        const user = userEvent.setup();
        render(<AuthContainer />);

        const input = screen.getByPlaceholderText('Enter your email');
        await user.type(input, 'reader@example.com');

        expect(input).toHaveValue('reader@example.com');
    });

    it('submits the entered email via signInWithOtp and shows a success message', async () => {
        vi.mocked(supabase.auth.signInWithOtp).mockResolvedValue({
            data: { user: null, session: null },
            error: null,
        });
        const user = userEvent.setup();
        render(<AuthContainer />);

        await user.type(screen.getByPlaceholderText('Enter your email'), 'reader@example.com');
        await user.click(screen.getByRole('button', { name: 'Send Magic Link' }));

        expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
            email: 'reader@example.com',
            options: { emailRedirectTo: window.location.origin },
        });
        expect(await screen.findByText('Check your email for the magic link!')).toBeInTheDocument();
    });

    it('shows the error message when signInWithOtp fails', async () => {
        // Real Supabase errors are AuthError instances (an Error subclass) --
        // AuthContainer narrows via `error instanceof Error`, so the mock has
        // to be a real Error, not a plain object shaped like one.
        const authError = Object.assign(new Error('Email address is invalid'), {
            name: 'AuthApiError',
        });
        vi.mocked(supabase.auth.signInWithOtp).mockResolvedValue({
            data: { user: null, session: null },
            error: authError as never,
        });
        const user = userEvent.setup();
        render(<AuthContainer />);

        await user.type(screen.getByPlaceholderText('Enter your email'), 'rejected@example.com');
        await user.click(screen.getByRole('button', { name: 'Send Magic Link' }));

        expect(await screen.findByText('Email address is invalid')).toBeInTheDocument();
    });
});
