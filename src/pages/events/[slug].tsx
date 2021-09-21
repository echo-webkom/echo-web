import { differenceInMilliseconds, formatISO, parseISO } from 'date-fns';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import React from 'react';
import ErrorBox from '../../components/error-box';
import HappeningUI from '../../components/happening';
import Layout from '../../components/layout';
import SEO from '../../components/seo';
import { Event, EventAPI } from '../../lib/api/event';
import { HappeningType, RegistrationAPI, SpotRangeCount } from '../../lib/api/registration';
import { useTimeout } from '../../lib/hooks';

const EventPage = ({
    event,
    backendUrl,
    spotRangeCounts,
    date,
    error,
}: {
    event: Event;
    backendUrl: string;
    spotRangeCounts: Array<SpotRangeCount>;
    date: number;
    error: string;
}): JSX.Element => {
    const router = useRouter();
    const regDate = parseISO(event?.registrationTime || formatISO(new Date()));
    const time =
        !event || differenceInMilliseconds(regDate, date) < 0 || differenceInMilliseconds(regDate, date) > 172800000
            ? null
            : differenceInMilliseconds(regDate, date);

    useTimeout(() => {
        if (event.registrationTime) router.replace(router.asPath, undefined, { scroll: false });
    }, time);

    return (
        <Layout>
            {error && !event && <ErrorBox error={error} />}
            {event && !error && (
                <>
                    <SEO title={event.title} />
                    <HappeningUI
                        bedpres={null}
                        event={event}
                        backendUrl={backendUrl}
                        spotRangeCounts={spotRangeCounts}
                        date={date}
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
    const { event, error } = await EventAPI.getEventBySlug(slug);
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey) throw Error('No ADMIN_KEY defined.');

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

    return {
        props: {
            event,
            spotRangeCounts,
            date,
            backendUrl,
            error,
        },
    };
};

export default EventPage;
