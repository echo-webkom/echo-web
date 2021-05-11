import React from 'react';
import { GetStaticProps } from 'next';
import { BedpresAPI, Bedpres } from '../../lib/api/bedpres';
import Layout from '../../components/layout';
import SEO from '../../components/seo';
import EntryOverview from '../../components/entry-overview';

const BedpresCollectionPage = ({ bedpreses, error }: { bedpreses: Array<Bedpres>; error: string }): JSX.Element => {
    return (
        <Layout>
            <SEO title="Bedriftspresentasjoner" />
            <EntryOverview entries={bedpreses} error={error} type="bedpres" />
        </Layout>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const { bedpreses, error } = await BedpresAPI.getBedpreses(0);

    if (bedpreses) {
        return {
            props: {
                bedpreses,
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
