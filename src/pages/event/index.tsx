import { GetStaticProps } from 'next';
import React from 'react';
import EntryOverview from '../../components/entry-overview';
import SEO from '../../components/seo';
import { isErrorMessage, Happening, HappeningAPI, HappeningType } from '../../lib/api';

interface Props {
    events: Array<Happening>;
}

const EventsCollectionPage = ({ events }: Props): JSX.Element => {
    return (
        <>
            <SEO title="Arrangementer" />
            <EntryOverview entries={events} type="event" />
        </>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const happenings = await HappeningAPI.getHappeningsByType(0, HappeningType.EVENT);

    if (isErrorMessage(happenings)) throw new Error(happenings.message);

    const props: Props = {
        events: happenings,
    };

    return { props };
};

export default EventsCollectionPage;
