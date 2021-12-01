import { GetStaticProps } from 'next';
import React from 'react';
import EntryOverview from '../../components/entry-overview';
import SEO from '../../components/seo';
import { Happening, HappeningAPI, HappeningType } from '../../lib/api';

interface Props {
    events: Array<Happening>;
    error: string | null;
}

const EventsCollectionPage = ({ events, error }: Props): JSX.Element => {
    return (
        <>
            <SEO title="Arrangementer" />
            <EntryOverview entries={events} error={error} type="event" />
        </>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const { happenings, error } = await HappeningAPI.getHappeningsByType(0, HappeningType.EVENT);

    if (happenings) {
        const props: Props = {
            events: happenings,
            error,
        };

        return { props };
    }

    return {
        props: {
            events: [],
            error,
        },
    };
};

export default EventsCollectionPage;
