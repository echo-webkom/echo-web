import React from 'react';
import { GetServerSideProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { Bedpres, BedpresAPI } from '../../lib/api/bedpres';
import { HappeningType, Registration, RegistrationAPI, RegistrationCount } from '../../lib/api/registration';
import Layout from '../../components/layout';
import SEO from '../../components/seo';
import ErrorBox from '../../components/error-box';
import HappeningUI from '../../components/happening';

const BedpresPage = ({
    bedpres,
    registrations,
    backendUrl,
    regCount,
    error,
}: {
    bedpres: Bedpres;
    registrations: Array<Registration>;
    backendUrl: string;
    regCount: RegistrationCount;
    error: string;
}): JSX.Element => {
    return (
        <Layout>
            {error && !bedpres && <ErrorBox error={error} />}
            {bedpres && !error && (
                <>
                    <SEO title={bedpres.title} />
                    <HappeningUI
                        bedpres={bedpres}
                        event={null}
                        registrations={registrations}
                        backendUrl={backendUrl}
                        regCount={regCount}
                    />
                </>
            )}
        </Layout>
    );
};

interface Params extends ParsedUrlQuery {
    slug: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { slug } = context.params as Params;
    const { bedpres, error } = await BedpresAPI.getBedpresBySlug(slug);
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

    const bedkomKey = process.env.BEDKOM_KEY;
    if (!bedkomKey) throw Error('No BEDKOM_KEY defined.');

    const showAdmin = context.query?.key === bedkomKey;

    const { registrations } = showAdmin
        ? await RegistrationAPI.getRegistrations(bedkomKey, slug, HappeningType.BEDPRES, backendUrl)
        : { registrations: [] };

    const { regCount } = await RegistrationAPI.getRegistrationCount(bedkomKey, slug, backendUrl);

    if (error === '404') {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            bedpres,
            registrations,
            regCount,
            backendUrl,
            error,
        },
    };
};

export default BedpresPage;
