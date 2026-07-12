import { createContext, useState, useEffect, type ReactNode } from 'react';

export interface ViewContextValue {
    showPublisher: boolean;
    toggleView: () => void;
}

const ViewContext = createContext<ViewContextValue | undefined>(undefined);

export function ViewProvider({ children }: { children: ReactNode }) {
    const [showPublisher, setShowPublisher] = useState<boolean>(() => {
        // Get initial state from localStorage or default to true
        const saved = localStorage.getItem('view-preference');
        return saved !== null ? JSON.parse(saved) : true;
    });

    // Update localStorage whenever showPublisher changes
    useEffect(() => {
        localStorage.setItem('view-preference', JSON.stringify(showPublisher));
    }, [showPublisher]);

    const toggleView = () => {
        setShowPublisher(!showPublisher);
    };

    return (
        <ViewContext.Provider value={{ showPublisher, toggleView }}>
            {children}
        </ViewContext.Provider>
    );
}

export { ViewContext };
