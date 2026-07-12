import Layout from '../components/Layout';
import Booth from '../components/Booth';
import NoBooths from '../components/NoBooths';
import Loading from '../components/Loading';
import { useFavorites } from '../queryHooks/useGetAllBooths';
import { sortBooths } from '../helperFns/sortBooths';
import { useView } from '../hooks/useView';

interface FavoriteBoothsProps {
    userId: string;
}

function FavoriteBooths({ userId }: FavoriteBoothsProps) {
    const { data: boothData, isLoading, error } = useFavorites(userId);
    const { showPublisher } = useView();

    if (isLoading) return <Loading />;
    if (error) return <div>Error: {error.message}</div>;

    const sortedData = sortBooths(boothData, showPublisher);

    const totalCount = boothData?.reduce((sum, publisher) => sum + publisher.titles.length, 0) ?? 0;
    const visitedCount =
        boothData?.reduce(
            (sum, publisher) => sum + publisher.titles.filter((title) => title.is_visited).length,
            0
        ) ?? 0;

    return (
        <Layout>
            <div>
                {boothData?.length === 0 ? (
                    <NoBooths />
                ) : (
                    <>
                        <p className="px-4 sm:px-6 py-2 text-sm font-medium text-gray-600 bg-gray-50">
                            {visitedCount} of {totalCount} visited
                        </p>
                        {sortedData.map((publisher) => (
                            <div key={publisher.publisher}>
                                <div className="bg-slate-700 py-2">
                                    <p className="text-xl text-white px-4 sm:px-6 my-0 font-bold">
                                        {publisher.publisher}{' '}
                                        {publisher?.location ? `#${publisher.location}` : ''}
                                    </p>
                                </div>
                                <ul className="divide-y divide-gray-200 list-none pl-0">
                                    {publisher.titles.map((title) => (
                                        <Booth key={title.id} title={title} userId={userId} />
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </Layout>
    );
}

export default FavoriteBooths;
