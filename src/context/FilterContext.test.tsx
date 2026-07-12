import { describe, it, expect } from 'vitest';
import { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import { FilterContext, FilterProvider } from './FilterContext';

describe('FilterProvider', () => {
    it('renders its children', () => {
        render(
            <FilterProvider>
                <p>child content</p>
            </FilterProvider>
        );

        expect(screen.getByText('child content')).toBeInTheDocument();
    });

    it('supplies a context value consumable via useContext(FilterContext)', () => {
        function Consumer() {
            const context = useContext(FilterContext);
            return <p>hideVisited: {String(context?.hideVisited)}</p>;
        }

        render(
            <FilterProvider>
                <Consumer />
            </FilterProvider>
        );

        expect(screen.getByText('hideVisited: false')).toBeInTheDocument();
    });

    it('context is undefined outside of a FilterProvider', () => {
        function Consumer() {
            const context = useContext(FilterContext);
            return <p>context: {context === undefined ? 'undefined' : 'defined'}</p>;
        }

        render(<Consumer />);

        expect(screen.getByText('context: undefined')).toBeInTheDocument();
    });
});
