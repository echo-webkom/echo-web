import { GetStaticProps } from 'next';
import React from 'react';
import EntryOverview from '../../components/entry-overview';
import SEO from '../../components/seo';
import { Happening, HappeningAPI, HappeningType } from '../../lib/api';

const EventsCollectionPage = ({ events, error }: { events: Array<Happening>; error: string }): JSX.Element => {
    return (
        <>
            <SEO title="Arrangementer" />
            <EntryOverview entries={events} error={error} type="event" />
        </>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const { happenings, error } = await HappeningAPI.getHappeningsByType(0, HappeningType.EVENT);

    return {
        props: {
            events: happenings,
            error,
        },
    };
};

export default EventsCollectionPage;
