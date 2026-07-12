import type { ReactNode } from 'react';
import Header from './Header';

function Layout({ children }: { children: ReactNode }) {
    return (
        <div>
            <Header />
            <main>{children}</main>
        </div>
    );
}

export default Layout;
