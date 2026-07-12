import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/test-utils';
import Layout from './Layout';

describe('Layout', () => {
    it('renders the header', () => {
        renderWithProviders(
            <Layout>
                <p>page content</p>
            </Layout>
        );

        expect(screen.getByText('GBooths')).toBeInTheDocument();
    });

    it('renders its children inside main', () => {
        renderWithProviders(
            <Layout>
                <p>page content</p>
            </Layout>
        );

        const main = screen.getByRole('main');
        expect(main).toHaveTextContent('page content');
    });
});
