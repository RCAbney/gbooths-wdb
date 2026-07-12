import Layout from '../components/Layout';
import Booth from '../components/Booth';
import Loading from '../components/Loading';
import { useGetAllBooths } from '../queryHooks/useGetAllBooths';
import { sortBooths } from '../helperFns/sortBooths';
import { filterBooths } from '../helperFns/filterBooths';
import { useView } from '../hooks/useView';
import { useFilters } from '../hooks/useFilters';

interface AllBoothsProps {
    userId: string;
}

function AllBooths({ userId }: AllBoothsProps) {
    const { data: boothData, isLoading, error } = useGetAllBooths(userId);
    const { showPublisher } = useView();
    const filters = useFilters();

    if (isLoading) return <Loading />;
    if (error) return <div>Error: {error.message}</div>;

    const sortedData = sortBooths(boothData, showPublisher);
    const filteredData = filterBooths(sortedData, filters);

    const availableTypes = [...new Set(sortedData.flatMap((p) => p.titles.map((t) => t.type)))];
    const availableAvailabilities = [
        ...new Set(sortedData.flatMap((p) => p.titles.map((t) => t.availability))),
    ];

    return (
        <Layout filterOptions={{ types: availableTypes, availabilities: availableAvailabilities }}>
            <div>
                {filteredData.length === 0 ? (
                    <p className="px-4 sm:px-6 py-4 text-sm text-gray-500">
                        No booths match your filters.
                    </p>
                ) : (
                    filteredData.map((publisher) => (
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
                    ))
                )}
            </div>
        </Layout>
    );
}

export default AllBooths;
