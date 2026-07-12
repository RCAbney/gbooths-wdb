import { useFilters } from '../hooks/useFilters';

interface FilterSheetProps {
    availableTypes: string[];
    availableAvailabilities: string[];
}

function FilterSheet({ availableTypes, availableAvailabilities }: FilterSheetProps) {
    const {
        excludedTypes,
        excludedAvailabilities,
        hideVisited,
        isFilterSheetOpen,
        toggleType,
        toggleAvailability,
        toggleHideVisited,
        closeFilterSheet,
        clearFilters,
    } = useFilters();

    if (!isFilterSheetOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={closeFilterSheet}
                aria-hidden="true"
            />
            <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-xl bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                    <button
                        onClick={closeFilterSheet}
                        className="text-sm font-medium text-gray-500"
                        aria-label="Close filters"
                    >
                        Close
                    </button>
                </div>

                {availableTypes.length > 0 && (
                    <fieldset className="mb-6">
                        <legend className="text-sm font-medium text-gray-700 mb-2">Type</legend>
                        <div className="space-y-2">
                            {availableTypes.map((type) => (
                                <label key={type} className="flex items-center gap-2 text-gray-900">
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 rounded border-gray-300 text-blue-600"
                                        checked={!excludedTypes.has(type)}
                                        onChange={() => toggleType(type)}
                                    />
                                    {type}
                                </label>
                            ))}
                        </div>
                    </fieldset>
                )}

                {availableAvailabilities.length > 0 && (
                    <fieldset className="mb-6">
                        <legend className="text-sm font-medium text-gray-700 mb-2">
                            Availability
                        </legend>
                        <div className="space-y-2">
                            {availableAvailabilities.map((availability) => (
                                <label
                                    key={availability}
                                    className="flex items-center gap-2 text-gray-900"
                                >
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 rounded border-gray-300 text-blue-600"
                                        checked={!excludedAvailabilities.has(availability)}
                                        onChange={() => toggleAvailability(availability)}
                                    />
                                    {availability}
                                </label>
                            ))}
                        </div>
                    </fieldset>
                )}

                <fieldset className="mb-6">
                    <label className="flex items-center gap-2 text-gray-900">
                        <input
                            type="checkbox"
                            className="h-5 w-5 rounded border-gray-300 text-blue-600"
                            checked={hideVisited}
                            onChange={toggleHideVisited}
                        />
                        Hide already-visited booths
                    </label>
                </fieldset>

                <div className="flex gap-4">
                    <button
                        onClick={clearFilters}
                        className="flex-1 py-2 px-4 rounded-md border border-gray-300 text-sm font-medium text-gray-700"
                    >
                        Clear all
                    </button>
                    <button
                        onClick={closeFilterSheet}
                        className="flex-1 py-2 px-4 rounded-md bg-blue-600 text-sm font-medium text-white"
                    >
                        Done
                    </button>
                </div>
            </div>
        </>
    );
}

export default FilterSheet;
