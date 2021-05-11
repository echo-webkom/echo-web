import React from 'react';
import { GetStaticProps } from 'next';
import { Event, EventAPI } from '../../lib/api/event';
import Layout from '../../components/layout';
import SEO from '../../components/seo';
import EntryOverview from '../../components/entry-overview';

const EventsCollectionPage = ({ events, error }: { events: Array<Event>; error: string }): JSX.Element => {
    return (
        <Layout>
            <SEO title="Arrangementer" />
            <EntryOverview entries={events} error={error} type="event" />
        </Layout>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const { events, error } = await EventAPI.getEvents(0);

    return {
        props: {
            events,
            error,
        },
    };
};

export default EventsCollectionPage;
