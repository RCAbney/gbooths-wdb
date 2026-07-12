import { describe, it, expect } from 'vitest';
import { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterSheet from './FilterSheet';
import { FilterProvider } from '../context/FilterContext';
import { useFilters } from '../hooks/useFilters';

function OpenSheet({
    availableTypes = ['Standalone', 'Expansion'],
    availableAvailabilities = ['For Sale', 'Demo'],
}: {
    availableTypes?: string[];
    availableAvailabilities?: string[];
}) {
    const { openFilterSheet } = useFilters();
    useEffect(() => {
        openFilterSheet();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- open once on mount only
    }, []);
    return (
        <FilterSheet
            availableTypes={availableTypes}
            availableAvailabilities={availableAvailabilities}
        />
    );
}

describe('FilterSheet', () => {
    it('renders nothing when the sheet is closed', () => {
        render(
            <FilterProvider>
                <FilterSheet
                    availableTypes={['Standalone']}
                    availableAvailabilities={['For Sale']}
                />
            </FilterProvider>
        );

        expect(screen.queryByText('Filters')).not.toBeInTheDocument();
    });

    it('renders a checkbox per available type and availability value when open', () => {
        render(
            <FilterProvider>
                <OpenSheet />
            </FilterProvider>
        );

        expect(screen.getByText('Filters')).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: 'Standalone' })).toBeChecked();
        expect(screen.getByRole('checkbox', { name: 'Expansion' })).toBeChecked();
        expect(screen.getByRole('checkbox', { name: 'For Sale' })).toBeChecked();
        expect(screen.getByRole('checkbox', { name: 'Demo' })).toBeChecked();
        expect(
            screen.getByRole('checkbox', { name: 'Hide already-visited booths' })
        ).not.toBeChecked();
    });

    it('unchecking a type checkbox excludes it', async () => {
        const user = userEvent.setup();
        render(
            <FilterProvider>
                <OpenSheet />
            </FilterProvider>
        );

        await user.click(screen.getByRole('checkbox', { name: 'Expansion' }));

        expect(screen.getByRole('checkbox', { name: 'Expansion' })).not.toBeChecked();
        expect(screen.getByRole('checkbox', { name: 'Standalone' })).toBeChecked();
    });

    it('"Clear all" resets every filter', async () => {
        const user = userEvent.setup();
        render(
            <FilterProvider>
                <OpenSheet />
            </FilterProvider>
        );

        await user.click(screen.getByRole('checkbox', { name: 'Expansion' }));
        await user.click(screen.getByRole('checkbox', { name: 'Hide already-visited booths' }));
        await user.click(screen.getByRole('button', { name: 'Clear all' }));

        expect(screen.getByRole('checkbox', { name: 'Expansion' })).toBeChecked();
        expect(
            screen.getByRole('checkbox', { name: 'Hide already-visited booths' })
        ).not.toBeChecked();
    });

    it('"Done" closes the sheet', async () => {
        const user = userEvent.setup();
        render(
            <FilterProvider>
                <OpenSheet />
            </FilterProvider>
        );

        await user.click(screen.getByRole('button', { name: 'Done' }));

        expect(screen.queryByText('Filters')).not.toBeInTheDocument();
    });
});
