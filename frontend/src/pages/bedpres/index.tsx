import { GetStaticProps } from 'next';
import React from 'react';
import EntryOverview from '../../components/entry-overview';
import SEO from '../../components/seo';
import { isErrorMessage, Happening, HappeningAPI, HappeningType } from '../../lib/api';

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
    const happenings = await HappeningAPI.getHappeningsByType(0, HappeningType.BEDPRES);

    if (isErrorMessage(happenings)) throw new Error(happenings.message);

    const props: Props = {
        bedpreses: happenings,
    };

    return { props };
};

export default BedpresCollectionPage;
