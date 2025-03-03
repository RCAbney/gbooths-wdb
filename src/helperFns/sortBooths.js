export const sortBooths = (boothData, showPublisher) => {
    const getNumericPart = (location) => {
        if (!location) return Number.MAX_VALUE; // Handle undefined locations
        const match = location.match(/^\d+/);
        return match ? parseInt(match[0], 10) : Number.MAX_VALUE;
    };

    return [...(boothData || [])].sort((a, b) => {
        if (showPublisher) {
            return a.publisher.localeCompare(b.publisher);
        } else {
            const numA = getNumericPart(a.location);
            const numB = getNumericPart(b.location);

            // If both locations start with numbers, compare numerically
            if (numA !== Number.MAX_VALUE && numB !== Number.MAX_VALUE) {
                return numA - numB;
            }

            // If one or both don't start with numbers, fall back to string comparison
            const locA = a.location || 'ZZZ';
            const locB = b.location || 'ZZZ';
            return locA.localeCompare(locB);
        }
    });
};
