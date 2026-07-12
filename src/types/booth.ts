export interface BoothTitle {
    id: string;
    title: string;
    type: string;
    bgg_id: string;
    availability: string;
    msrp: string;
    isFavorite: boolean;
    is_visited: boolean;
}

export interface PublisherGroup {
    publisher: string;
    location: string | null;
    titles: BoothTitle[];
}
