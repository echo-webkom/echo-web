import { GetStaticProps } from 'next';
import React from 'react';
import EntryOverview from '../../components/entry-overview';
import SEO from '../../components/seo';
import { Happening, HappeningAPI, HappeningType } from '../../lib/api';

interface Props {
    bedpreses: Array<Happening>;
    error: string | null;
}

const BedpresCollectionPage = ({ bedpreses, error }: Props): JSX.Element => {
    return (
        <>
            <SEO title="Bedriftspresentasjoner" />
            <EntryOverview entries={bedpreses} error={error} type="bedpres" />
        </>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const { happenings, error } = await HappeningAPI.getHappeningsByType(0, HappeningType.BEDPRES);

    if (happenings) {
        const props: Props = {
            bedpreses: happenings,
            error,
        };

        return { props };
    }

    return {
        props: {
            bedpreses: [],
            error,
        },
    };
};

export default BedpresCollectionPage;
