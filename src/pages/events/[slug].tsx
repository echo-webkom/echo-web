import React from 'react';
import { GetServerSideProps } from 'next';
import { ParsedUrlQuery } from 'querystring';

import Layout from '../../components/layout';
import SEO from '../../components/seo';
import { EventAPI, Event } from '../../lib/api/event';

import ErrorBox from '../../components/error-box';
import HappeningUI from '../../components/happening';
import { HappeningType, Registration, RegistrationAPI, RegistrationCount } from '../../lib/api/registration';

const EventPage = ({
    event,
    registrations,
    backendUrl,
    regCount,
    date,
    error,
}: {
    event: Event;
    registrations: Array<Registration>;
    backendUrl: string;
    regCount: RegistrationCount;
    date: Date;
    error: string;
}): JSX.Element => {
    return (
        <Layout>
            {error && !event && <ErrorBox error={error} />}
            {event && !error && (
                <>
                    <SEO title={event.title} />
                    <HappeningUI
                        bedpres={null}
                        event={event}
                        registrations={registrations}
                        backendUrl={backendUrl}
                        regCount={regCount}
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

    const bedkomKey = process.env.BEDKOM_KEY;
    if (!bedkomKey) throw Error('No BEDKOM_KEY defined.');

    const showAdmin = context.query?.key === bedkomKey;

    const { registrations } = showAdmin
        ? await RegistrationAPI.getRegistrations(bedkomKey, slug, HappeningType.BEDPRES, backendUrl)
        : { registrations: [] };

    const { regCount } = await RegistrationAPI.getRegistrationCount(bedkomKey, slug, HappeningType.EVENT, backendUrl);

    const date = new Date();

    if (error === '404') {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            event,
            registrations,
            regCount,
            date,
            backendUrl,
            error,
        },
    };
};

export default EventPage;
