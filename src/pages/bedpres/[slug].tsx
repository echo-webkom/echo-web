import { ParsedUrlQuery } from 'querystring';
import { useTimeout } from '@chakra-ui/react';
import { differenceInMilliseconds, parseISO } from 'date-fns';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import ErrorBox from '../../components/error-box';
import HappeningUI from '../../components/happening';
import SEO from '../../components/seo';
import { Happening, HappeningAPI, HappeningType, RegistrationAPI, SpotRangeCount } from '../../lib/api';

const BedpresPage = ({
    happening,
    backendUrl,
    spotRangeCounts,
    date,
    error,
}: {
    happening: Happening;
    backendUrl: string;
    spotRangeCounts: Array<SpotRangeCount>;
    date: number;
    error: string;
}): JSX.Element => {
    const router = useRouter();
    const regDate = happening.registrationDate ? parseISO(happening.registrationDate) : new Date();
    const time =
        !happening || differenceInMilliseconds(regDate, date) < 0 || differenceInMilliseconds(regDate, date) > 172800000
            ? null
            : differenceInMilliseconds(regDate, date);

    useTimeout(() => {
        router.replace(router.asPath, undefined, { scroll: false });
    }, time);

    return (
        <>
            {error && !happening && <ErrorBox error={error} />}
            {happening && !error && (
                <>
                    <SEO title={happening.title} />
                    <HappeningUI
                        happening={happening}
                        backendUrl={backendUrl}
                        spotRangeCounts={spotRangeCounts}
                        date={date}
                    />
                </>
            )}
        </>
    );
};

interface Params extends ParsedUrlQuery {
    slug: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { slug } = context.params as Params;
    const { happening, error } = await HappeningAPI.getHappeningBySlug(slug);
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey) throw Error('No ADMIN_KEY defined.');

    const { spotRangeCounts } = await RegistrationAPI.getSpotRangeCounts(
        adminKey,
        slug,
        HappeningType.BEDPRES,
        backendUrl,
    );

    const date = Date.now();

    if (error === '404') {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            happening,
            spotRangeCounts,
            date,
            backendUrl,
            error,
        },
    };
};

export default BedpresPage;
