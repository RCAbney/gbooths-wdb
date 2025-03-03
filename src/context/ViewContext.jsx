import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const ViewContext = createContext();

export function ViewProvider({ children }) {
    const [showPublisher, setShowPublisher] = useState(true);

    const toggleView = () => {
        setShowPublisher(!showPublisher);
    };

    return (
        <ViewContext.Provider value={{ showPublisher, toggleView }}>
            {children}
        </ViewContext.Provider>
    );
}

ViewProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export function useView() {
    const context = useContext(ViewContext);
    if (context === undefined) {
        throw new Error('useView must be used within a ViewProvider');
    }
    return context;
}
