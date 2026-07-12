import { describe, it, expect } from 'vitest';
import { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import { ViewContext, ViewProvider } from './ViewContext';

describe('ViewProvider', () => {
    it('renders its children', () => {
        render(
            <ViewProvider>
                <p>child content</p>
            </ViewProvider>
        );

        expect(screen.getByText('child content')).toBeInTheDocument();
    });

    it('supplies a context value consumable via useContext(ViewContext)', () => {
        function Consumer() {
            const context = useContext(ViewContext);
            return <p>showPublisher: {String(context?.showPublisher)}</p>;
        }

        render(
            <ViewProvider>
                <Consumer />
            </ViewProvider>
        );

        expect(screen.getByText('showPublisher: true')).toBeInTheDocument();
    });

    it('context is undefined outside of a ViewProvider', () => {
        function Consumer() {
            const context = useContext(ViewContext);
            return <p>context: {context === undefined ? 'undefined' : 'defined'}</p>;
        }

        render(<Consumer />);

        expect(screen.getByText('context: undefined')).toBeInTheDocument();
    });
});
