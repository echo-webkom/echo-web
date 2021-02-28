import React from 'react';

import { GetStaticProps } from 'next';
import Layout from '../components/layout';
import SEO from '../components/seo';
import EventBlock from '../components/event-block';
import { Event } from '../lib';
import EventAPI from '../lib/api/event';

const IndexPage = ({ events }: { events: Array<Event> }): JSX.Element => (
    <Layout>
        <SEO title="Home" />
        <EventBlock events={events} />
    </Layout>
);

export const getStaticProps: GetStaticProps = async () => {
    const { events } = await EventAPI.getEvents(3);

    return {
        props: {
            events,
        },
    };
};

export default IndexPage;
