import type { ReactNode } from 'react';
import Header from './Header';
import FilterSheet from './FilterSheet';

interface LayoutProps {
    children: ReactNode;
    filterOptions?: {
        types: string[];
        availabilities: string[];
    };
}

function Layout({ children, filterOptions }: LayoutProps) {
    return (
        <div>
            <Header />
            <main>{children}</main>
            <FilterSheet
                availableTypes={filterOptions?.types ?? []}
                availableAvailabilities={filterOptions?.availabilities ?? []}
            />
        </div>
    );
}

export default Layout;
