import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ViewContext = createContext();

export function ViewProvider({ children }) {
    const [showPublisher, setShowPublisher] = useState(() => {
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

ViewProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export { ViewContext };
