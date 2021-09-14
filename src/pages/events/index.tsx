import { GetStaticProps } from 'next';
import React from 'react';
import EntryOverview from '../../components/entry-overview';
import Layout from '../../components/layout';
import SEO from '../../components/seo';
import { Event, EventAPI } from '../../lib/api/event';

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
