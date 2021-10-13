import { GetStaticProps } from 'next';
import React from 'react';
import EntryOverview from '../../components/entry-overview';
import Layout from '../../components/layout';
import SEO from '../../components/seo';
import { Happening, HappeningAPI, HappeningType } from '../../lib/api';

const BedpresCollectionPage = ({ bedpreses, error }: { bedpreses: Array<Happening>; error: string }): JSX.Element => {
    return (
        <Layout>
            <SEO title="Bedriftspresentasjoner" />
            <EntryOverview entries={bedpreses} error={error} type="bedpres" />
        </Layout>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const { happenings, error } = await HappeningAPI.getHappeningsByType(0, HappeningType.BEDPRES);

    if (happenings) {
        return {
            props: {
                bedpreses: happenings,
                error,
            },
        };
    }
    return {
        props: {
            bedpreses: [],
            error,
        },
    };
};

export default BedpresCollectionPage;
