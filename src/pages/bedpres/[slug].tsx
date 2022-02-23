import { ParsedUrlQuery } from 'querystring';
import { GetServerSideProps } from 'next';
import React from 'react';
import { isErrorMessage, Happening, HappeningAPI, HappeningType, RegistrationAPI, SpotRangeCount } from '../../lib/api';
import HappeningPage from '../../components/happening-page';

interface Props {
    happening: Happening | null;
    backendUrl: string;
    spotRangeCounts: Array<SpotRangeCount> | null;
    date: number;
    error: string | null;
}

const BedpresPage = ({ happening, backendUrl, spotRangeCounts, date, error }: Props): JSX.Element => {
    return (
        <HappeningPage
            happening={happening}
            backendUrl={backendUrl}
            spotRangeCounts={spotRangeCounts}
            date={date}
            error={error}
        />
    );
};

interface Params extends ParsedUrlQuery {
    slug: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { slug } = context.params as Params;
    const happening = await HappeningAPI.getHappeningBySlug(slug);
    const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8080';

    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey) throw new Error('No ADMIN_KEY defined.');

    const spotRangeCounts = await RegistrationAPI.getSpotRangeCounts(adminKey, slug, HappeningType.BEDPRES, backendUrl);

    const date = Date.now();

    if (isErrorMessage(happening) && happening.message === '404') {
        return {
            notFound: true,
        };
    }

    const props: Props = {
        happening: isErrorMessage(happening) ? null : happening,
        spotRangeCounts: isErrorMessage(spotRangeCounts) ? null : spotRangeCounts,
        date,
        backendUrl,
        error: !isErrorMessage(happening) ? null : 'Det har skjedd en feil.',
    };

    return {
        props,
    };
};

export default BedpresPage;
