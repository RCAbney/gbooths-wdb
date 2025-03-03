import PropTypes from 'prop-types';
import Layout from '../components/Layout';
import Booth from '../components/Booth';
import NoBooths from '../components/NoBooths';
import Loading from '../components/Loading';
import { useFavorites } from '../queryHooks/useGetAllBooths';
import { ViewContext } from '../context/ViewContext';
import { sortBooths } from '../helperFns/sortBooths';
import { useContext } from 'react';

function FavoriteBooths({ userId }) {
    const { data: boothData, isLoading, error } = useFavorites(userId);
    const { showPublisher } = useContext(ViewContext);

    if (isLoading) return <Loading />;
    if (error) return <div>Error: {error.message}</div>;

    const sortedData = sortBooths(boothData, showPublisher);

    return (
        <Layout>
            <div>
                {boothData?.length === 0 ? (
                    <NoBooths />
                ) : (
                    sortedData.map((publisher) => (
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

FavoriteBooths.propTypes = {
    userId: PropTypes.string.isRequired,
};

export default FavoriteBooths;
