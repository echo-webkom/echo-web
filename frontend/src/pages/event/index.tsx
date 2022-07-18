import type { GetStaticProps } from 'next';
import type { Happening } from '@api/happening';
import { HappeningAPI } from '@api/happening';
import { isErrorMessage } from '@utils/error';
import EntryOverview from '@components/entry-overview';
import SEO from '@components/seo';

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
    const happenings = await HappeningAPI.getHappeningsByType(0, 'EVENT');

    if (isErrorMessage(happenings)) throw new Error(happenings.message);

    const props: Props = {
        events: happenings,
    };

    return { props };
};

export default EventsCollectionPage;
