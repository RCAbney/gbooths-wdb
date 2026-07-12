import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NoBooths from './NoBooths';

describe('NoBooths', () => {
    it('renders a link to the home route', () => {
        render(
            <MemoryRouter>
                <NoBooths />
            </MemoryRouter>
        );

        expect(screen.getByRole('link')).toHaveAttribute('href', '/');
    });

    it('renders the explanatory copy', () => {
        render(
            <MemoryRouter>
                <NoBooths />
            </MemoryRouter>
        );

        expect(
            screen.getByText('It doesn’t look like you’ve added any booths to visit yet.')
        ).toBeInTheDocument();
        expect(
            screen.getByText('Tap here or on View All in the menu to see all listed booths.')
        ).toBeInTheDocument();
    });
});
