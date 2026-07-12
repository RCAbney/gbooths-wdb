import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/test-utils';
import Header from './Header';
import FilterSheet from './FilterSheet';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../lib/supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(),
            signOut: vi.fn(),
        },
    },
}));

vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('Header', () => {
    beforeEach(() => {
        mockNavigate.mockReset();
        vi.mocked(supabase.auth.getSession).mockReset();
        vi.mocked(supabase.auth.signOut).mockReset();
        vi.mocked(toast.success).mockReset();
        vi.mocked(toast.error).mockReset();
    });

    it('renders the GBooths title', () => {
        renderWithProviders(<Header />);

        expect(screen.getByText('GBooths')).toBeInTheDocument();
    });

    it('toggles the publisher/location button label when clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Header />);

        const toggleButton = screen.getByRole('button', { name: 'Publisher' });
        await user.click(toggleButton);

        expect(screen.getByRole('button', { name: 'Location' })).toBeInTheDocument();
    });

    it('opens the filter sheet when the filter button is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <>
                <Header />
                <FilterSheet
                    availableTypes={['Standalone']}
                    availableAvailabilities={['For Sale']}
                />
            </>
        );

        expect(screen.queryByText('Filters')).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Filter booths' }));

        expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('signs out, shows a success toast, and navigates home on success', async () => {
        vi.mocked(supabase.auth.getSession).mockResolvedValue({
            data: { session: { user: { id: 'user-1' } } as never },
            error: null,
        });
        vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });
        const user = userEvent.setup();
        renderWithProviders(<Header />);

        await user.click(screen.getByRole('button', { name: /sign out/i }));

        expect(toast.success).toHaveBeenCalledWith('Signed out successfully');
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('treats a missing session on sign out as a successful sign-out', async () => {
        vi.mocked(supabase.auth.getSession).mockResolvedValue({
            data: { session: null },
            error: null,
        });
        vi.mocked(supabase.auth.signOut).mockResolvedValue({
            error: { name: 'AuthSessionMissingError', message: 'Auth session missing' } as never,
        });
        const user = userEvent.setup();
        renderWithProviders(<Header />);

        await user.click(screen.getByRole('button', { name: /sign out/i }));

        expect(toast.success).toHaveBeenCalledWith('Signed out successfully');
        expect(mockNavigate).toHaveBeenCalledWith('/');
        expect(toast.error).not.toHaveBeenCalled();
    });

    it('shows an error toast when sign out fails for another reason', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.mocked(supabase.auth.getSession).mockResolvedValue({
            data: { session: { user: { id: 'user-1' } } as never },
            error: null,
        });
        vi.mocked(supabase.auth.signOut).mockResolvedValue({
            error: { name: 'AuthApiError', message: 'Network error' } as never,
        });
        const user = userEvent.setup();
        renderWithProviders(<Header />);

        await user.click(screen.getByRole('button', { name: /sign out/i }));

        expect(toast.error).toHaveBeenCalledWith(
            'Unable to sign out. Please try closing and reopening the app.'
        );
        expect(mockNavigate).not.toHaveBeenCalled();

        consoleError.mockRestore();
    });
});
