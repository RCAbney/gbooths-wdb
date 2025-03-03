import { PlusIcon as PlusIconOutline } from '@heroicons/react/24/outline';
import { MinusIcon as MinusIconOutline } from '@heroicons/react/24/outline';
import { EyeIcon as EyeIconOutline } from '@heroicons/react/24/outline';
import { EyeSlashIcon as EyeOffIconOutline } from '@heroicons/react/24/outline';
import { BUTTON_BASE_STYLES, COLOR_VARIANTS } from '../constants/styles';
import {
    useAddToFavorites,
    useRemoveFromFavorites,
    useAddIsVisited,
    useRemoveIsVisited,
} from '../queryHooks/useGetAllBooths';
import PropTypes from 'prop-types';

function Booth({ title, userId }) {
    const addToFavorites = useAddToFavorites();
    const removeFromFavorites = useRemoveFromFavorites();
    const addIsVisited = useAddIsVisited();
    const removeIsVisited = useRemoveIsVisited();

    const isFavorite = title.isFavorite;
    const isVisited = title.is_visited;

    const selected = isFavorite ? COLOR_VARIANTS.selected.active : COLOR_VARIANTS.selected.inactive;
    const visited = isVisited ? COLOR_VARIANTS.visited.active : COLOR_VARIANTS.visited.inactive;

    const handleFavoriteToggle = async () => {
        try {
            if (isFavorite) {
                await removeFromFavorites.mutateAsync({
                    userId,
                    boothId: title.id,
                    title: title.title,
                });
            } else {
                await addToFavorites.mutateAsync({
                    userId,
                    boothId: title.id,
                    title: title.title,
                });
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleVisitedToggle = async () => {
        try {
            if (isVisited) {
                await removeIsVisited.mutateAsync({
                    userId,
                    boothId: title.id,
                    title: title.title,
                });
            } else {
                await addIsVisited.mutateAsync({
                    userId,
                    boothId: title.id,
                    title: title.title,
                });
            }
        } catch (error) {
            console.error('Error toggling visited status:', error);
        }
    };

    const isLoading =
        addToFavorites.isPending ||
        removeFromFavorites.isPending ||
        addIsVisited.isPending ||
        removeIsVisited.isPending;

    return (
        <li className="pl-0">
            <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                    <div className="max-w-[70%]">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                            <a
                                href={`https://boardgamegeek.com/boardgame/${title.bgg_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {title.title}
                            </a>
                            <span className="text-xs text-gray-500 font-light"></span>
                        </p>
                        <p className="flex items-center text-sm text-gray-500">
                            {title.availability} - {title.msrp === 'N/A' ? 'N/A' : `$${title.msrp}`}
                        </p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                        <button
                            onClick={handleVisitedToggle}
                            disabled={isLoading}
                            className={`${BUTTON_BASE_STYLES} ${visited}`}
                        >
                            {isVisited ? (
                                <EyeOffIconOutline className="h-6 w-6" aria-hidden="true" />
                            ) : (
                                <EyeIconOutline className="h-6 w-6" aria-hidden="true" />
                            )}
                        </button>

                        <button
                            onClick={handleFavoriteToggle}
                            disabled={isLoading}
                            className={`ml-2 ${BUTTON_BASE_STYLES} ${selected}`}
                        >
                            {isFavorite ? (
                                <MinusIconOutline className="h-6 w-6" aria-hidden="true" />
                            ) : (
                                <PlusIconOutline className="h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </li>
    );
}

Booth.propTypes = {
    title: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        bgg_id: PropTypes.string.isRequired,
        availability: PropTypes.string.isRequired,
        msrp: PropTypes.string.isRequired,
        isFavorite: PropTypes.bool,
        is_visited: PropTypes.bool,
    }).isRequired,
    userId: PropTypes.string.isRequired,
};

export default Booth;
