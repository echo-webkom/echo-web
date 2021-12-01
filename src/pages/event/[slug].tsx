import { ParsedUrlQuery } from 'querystring';
import { useTimeout } from '@chakra-ui/react';
import { differenceInMilliseconds, formatISO, parseISO } from 'date-fns';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import ErrorBox from '../../components/error-box';
import HappeningUI from '../../components/happening';
import SEO from '../../components/seo';
import { Happening, HappeningAPI, HappeningType, RegistrationAPI, SpotRangeCount } from '../../lib/api';

interface Props {
    happening: Happening | null;
    backendUrl: string;
    spotRangeCounts: Array<SpotRangeCount> | null;
    date: number;
    error: string | null;
}

const EventPage = ({ happening, backendUrl, spotRangeCounts, date, error }: Props): JSX.Element => {
    const router = useRouter();
    const regDate = parseISO(happening?.registrationDate ?? formatISO(new Date()));
    const time =
        !happening ||
        differenceInMilliseconds(regDate, date) < 0 ||
        differenceInMilliseconds(regDate, date) > 172_800_000
            ? null
            : differenceInMilliseconds(regDate, date);

    /* eslint-disable @typescript-eslint/no-floating-promises */
    useTimeout(() => {
        if (happening?.registrationDate) router.replace(router.asPath, undefined, { scroll: false });
    }, time);
    /* eslint-enable @typescript-eslint/no-floating-promises */

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
    const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8080';

    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey) throw new Error('No ADMIN_KEY defined.');

    const { spotRangeCounts } = await RegistrationAPI.getSpotRangeCounts(
        adminKey,
        slug,
        HappeningType.EVENT,
        backendUrl,
    );

    const date = Date.now();

    if (error === '404') {
        return {
            notFound: true,
        };
    }

    const props: Props = {
        happening,
        spotRangeCounts,
        date,
        backendUrl,
        error,
    };

    return {
        props,
    };
};

export default EventPage;
