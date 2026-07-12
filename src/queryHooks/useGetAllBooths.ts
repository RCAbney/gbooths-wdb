import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';
import type { BoothTitle, PublisherGroup } from '../types/booth';

interface BoothRow {
    id: string;
    title: string;
    publisher: string;
    location: string | null;
    availability: string;
    msrp: string;
    bgg_id: string;
}

interface FavoriteIdRow {
    booth_id: string;
    is_visited: boolean;
}

interface FavoriteWithBoothRow {
    booths: BoothRow;
    is_visited: boolean;
}

interface MutationVariables {
    userId: string;
    boothId: string;
    title: string;
}

interface MutationContext {
    previousBooths: PublisherGroup[] | undefined;
    previousFavorites: PublisherGroup[] | undefined;
    boothsKey: [string, string];
    favoritesKey: [string, string];
}

const fetchBooths = async (userId: string): Promise<PublisherGroup[]> => {
    // First get all booths
    const { data: booths, error: boothsError } = await supabase
        .from('booths')
        .select('id, title, publisher, location, availability, msrp, bgg_id')
        .order('publisher', { ascending: true })
        .returns<BoothRow[]>();

    if (boothsError) throw new Error(boothsError.message);

    // Then get user's favorites to mark which booths are favorited and visited
    const { data: favorites, error: favoritesError } = await supabase
        .from('favorites')
        .select('booth_id, is_visited')
        .eq('user_id', userId)
        .returns<FavoriteIdRow[]>();

    if (favoritesError) throw new Error(favoritesError.message);

    // Create maps for both favorite status and visited status
    const favoriteIds = new Set(favorites?.map((f) => f.booth_id) || []);
    const visitedStatus = new Map(favorites?.map((f) => [f.booth_id, f.is_visited]) || []);

    // Group by publisher and include isFavorite and is_visited flags
    const groupedByPublisher = booths.reduce<Record<string, PublisherGroup>>((acc, booth) => {
        const { id, publisher, location, title, availability, msrp, bgg_id } = booth;
        if (!acc[publisher]) {
            acc[publisher] = {
                publisher,
                location,
                titles: [],
            };
        }
        acc[publisher].titles.push({
            id,
            title,
            availability,
            msrp,
            bgg_id,
            isFavorite: favoriteIds.has(id),
            is_visited: visitedStatus.get(id) || false,
        });
        return acc;
    }, {});

    return Object.values(groupedByPublisher);
};

export const useGetAllBooths = (userId: string) => {
    return useQuery({
        queryKey: ['booths', userId],
        queryFn: () => fetchBooths(userId),
        enabled: !!userId,
        refetchOnWindowFocus: false,
    });
};

const fetchFavorites = async (userId: string): Promise<PublisherGroup[]> => {
    const { data, error } = await supabase
        .from('favorites')
        .select('booths(title, publisher, location, availability, msrp, bgg_id, id), is_visited')
        .eq('user_id', userId)
        .returns<FavoriteWithBoothRow[]>();

    if (error) throw new Error(error.message);

    // Group by publisher
    const groupedByPublisher = data.reduce<Record<string, PublisherGroup>>((acc, fav) => {
        const { publisher, location, title, availability, msrp, bgg_id, id } = fav.booths;
        if (!acc[publisher]) {
            acc[publisher] = {
                publisher,
                location,
                titles: [],
            };
        }
        acc[publisher].titles.push({
            title,
            availability,
            msrp,
            bgg_id,
            id,
            is_visited: fav.is_visited,
            isFavorite: true, // These are all favorites since they're from the favorites table
        });
        return acc;
    }, {});

    // Sort titles alphabetically within each publisher group
    Object.values(groupedByPublisher).forEach((group) => {
        group.titles.sort((a, b) => a.title.localeCompare(b.title));
    });

    return Object.values(groupedByPublisher);
};

export const useFavorites = (userId: string) => {
    return useQuery({
        queryKey: ['favorites', userId],
        queryFn: () => fetchFavorites(userId),
        enabled: !!userId,
    });
};

const addIsVisited = async ({ userId, boothId, title }: MutationVariables) => {
    const { error } = await supabase
        .from('favorites')
        .upsert(
            {
                user_id: userId,
                booth_id: boothId,
                is_visited: true,
            },
            {
                onConflict: 'user_id,booth_id',
            }
        )
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to mark as visited: ${error.message}`);
    }

    return { title, newValue: true };
};

export const useAddIsVisited = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addIsVisited,
        onMutate: async ({ userId, boothId }): Promise<MutationContext> => {
            const boothsKey: [string, string] = ['booths', userId];
            const favoritesKey: [string, string] = ['favorites', userId];

            await queryClient.cancelQueries({ queryKey: boothsKey });
            await queryClient.cancelQueries({ queryKey: favoritesKey });

            const previousBooths = queryClient.getQueryData<PublisherGroup[]>(boothsKey);
            const previousFavorites = queryClient.getQueryData<PublisherGroup[]>(favoritesKey);

            queryClient.setQueryData<PublisherGroup[]>(boothsKey, (old) => {
                if (!old) return old;
                return old.map((publisher) => ({
                    ...publisher,
                    titles: publisher.titles.map((booth): BoothTitle => {
                        if (booth.id === boothId) {
                            return {
                                ...booth,
                                is_visited: true,
                                isFavorite: true,
                            };
                        }
                        return booth;
                    }),
                }));
            });

            return { previousBooths, previousFavorites, boothsKey, favoritesKey };
        },
        onError: (err, _variables, context) => {
            if (context?.previousBooths) {
                queryClient.setQueryData(context.boothsKey, context.previousBooths);
            }
            if (context?.previousFavorites) {
                queryClient.setQueryData(context.favoritesKey, context.previousFavorites);
            }
            toast.error(`Error marking as visited: ${err.message}`, {
                position: 'top-center',
                autoClose: 750,
            });
        },
        onSuccess: ({ title }) => {
            toast.success(`Marked "${title}" as visited`, {
                position: 'top-center',
                autoClose: 750,
            });
        },
        onSettled: (_data, _error, { userId }) => {
            queryClient.invalidateQueries({ queryKey: ['booths', userId] });
            queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
        },
    });
};

const removeIsVisited = async ({ userId, boothId, title }: MutationVariables) => {
    const { error } = await supabase
        .from('favorites')
        .upsert(
            {
                user_id: userId,
                booth_id: boothId,
                is_visited: false,
            },
            {
                onConflict: 'user_id,booth_id',
            }
        )
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to mark as not visited: ${error.message}`);
    }

    return { title, newValue: false };
};

export const useRemoveIsVisited = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: removeIsVisited,
        onMutate: async ({ userId, boothId }): Promise<MutationContext> => {
            const boothsKey: [string, string] = ['booths', userId];
            const favoritesKey: [string, string] = ['favorites', userId];

            await queryClient.cancelQueries({ queryKey: boothsKey });
            await queryClient.cancelQueries({ queryKey: favoritesKey });

            const previousBooths = queryClient.getQueryData<PublisherGroup[]>(boothsKey);
            const previousFavorites = queryClient.getQueryData<PublisherGroup[]>(favoritesKey);

            queryClient.setQueryData<PublisherGroup[]>(boothsKey, (old) => {
                if (!old) return old;
                return old.map((publisher) => ({
                    ...publisher,
                    titles: publisher.titles.map((booth): BoothTitle => {
                        if (booth.id === boothId) {
                            return {
                                ...booth,
                                is_visited: false,
                                isFavorite: true,
                            };
                        }
                        return booth;
                    }),
                }));
            });

            return { previousBooths, previousFavorites, boothsKey, favoritesKey };
        },
        onError: (err, _variables, context) => {
            if (context?.previousBooths) {
                queryClient.setQueryData(context.boothsKey, context.previousBooths);
            }
            if (context?.previousFavorites) {
                queryClient.setQueryData(context.favoritesKey, context.previousFavorites);
            }
            toast.error(`Error marking as not visited: ${err.message}`, {
                position: 'top-center',
                autoClose: 750,
            });
        },
        onSuccess: ({ title }) => {
            toast.success(`Marked "${title}" as not visited`, {
                position: 'top-center',
                autoClose: 750,
            });
        },
        onSettled: (_data, _error, { userId }) => {
            queryClient.invalidateQueries({ queryKey: ['booths', userId] });
            queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
        },
    });
};

const addToFavorites = async ({ userId, boothId, title }: MutationVariables) => {
    const { error } = await supabase
        .from('favorites')
        .insert([{ user_id: userId, booth_id: boothId, is_visited: false }]);

    if (error) throw new Error(error.message);
    return title; // Return title to use in onSuccess
};

export const useAddToFavorites = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addToFavorites,
        onSuccess: (title) => {
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
            queryClient.invalidateQueries({ queryKey: ['booths'] });
            toast.success(`Added "${title}" to favorites!`, {
                position: 'top-center',
                autoClose: 750,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        },
        onError: (error) => {
            toast.error(`Error adding to favorites: ${error.message}`, {
                position: 'top-center',
                autoClose: 750,
            });
        },
    });
};

const removeFromFavorites = async ({ userId, boothId, title }: MutationVariables) => {
    const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('booth_id', boothId);

    if (error) throw new Error(error.message);
    return title; // Return title to use in onSuccess
};

export const useRemoveFromFavorites = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: removeFromFavorites,
        onSuccess: (title) => {
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
            queryClient.invalidateQueries({ queryKey: ['booths'] });
            toast.success(`Removed "${title}" from favorites`, {
                position: 'top-center',
                autoClose: 750,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        },
        onError: (error) => {
            toast.error(`Error removing from favorites: ${error.message}`, {
                position: 'top-center',
                autoClose: 750,
            });
        },
    });
};
