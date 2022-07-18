import type { GetStaticProps } from 'next';
import type { Happening } from '@api/happening';
import { HappeningAPI } from '@api/happening';
import { isErrorMessage } from '@utils/error';
import EntryOverview from '@components/entry-overview';
import SEO from '@components/seo';

interface Props {
    bedpreses: Array<Happening>;
}

const BedpresCollectionPage = ({ bedpreses }: Props): JSX.Element => {
    return (
        <>
            <SEO title="Bedriftspresentasjoner" />
            <EntryOverview entries={bedpreses} type="bedpres" />
        </>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const happenings = await HappeningAPI.getHappeningsByType(0, 'BEDPRES');

    if (isErrorMessage(happenings)) throw new Error(happenings.message);

    const props: Props = {
        bedpreses: happenings,
    };

    return { props };
};

export default BedpresCollectionPage;
