import { GridItem, Heading, SimpleGrid } from '@chakra-ui/react';
import { GetStaticProps } from 'next';
import EventCalendar from '../../components/event-calendar';
import EventOverview from '../../components/event-overview';
import SEO from '../../components/seo';
import {
    Happening,
    HappeningAPI,
    HappeningType,
    isErrorMessage,
    RegistrationAPI,
    RegistrationCount,
} from '../../lib/api';

interface Props {
    events: Array<Happening>;
    bedpresses: Array<Happening>;
    registrationCounts: Array<RegistrationCount>;
}

const HappeningsOverviewPage = ({ events, bedpresses, registrationCounts }: Props): JSX.Element => {
    return (
        <>
            <SEO title="Arrangementer" />
            <Heading>Arrangementer</Heading>
            <SimpleGrid columns={[1, null, null, 2]} gap="6">
                <GridItem colSpan={[1, null, null, 1, 2]}>
                    <EventCalendar events={[...events, ...bedpresses]} />
                </GridItem>
                <GridItem>
                    <EventOverview
                        title="Arrangement"
                        events={events}
                        registrationCounts={registrationCounts}
                        type="event"
                    />
                </GridItem>
                <GridItem>
                    <EventOverview
                        title="Bedriftspresentasjon"
                        events={bedpresses}
                        registrationCounts={registrationCounts}
                        type="bedpres"
                    />
                </GridItem>
            </SimpleGrid>
        </>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const eventsResponse = await HappeningAPI.getHappeningsByType(0, HappeningType.EVENT);
    const bedpressesResponse = await HappeningAPI.getHappeningsByType(0, HappeningType.BEDPRES);

    if (isErrorMessage(eventsResponse)) throw new Error(eventsResponse.message);
    if (isErrorMessage(bedpressesResponse)) throw new Error(bedpressesResponse.message);

    const slugs = [...bedpressesResponse, ...eventsResponse].map((happening: Happening) => happening.slug);
    const registrationCountsResponse = await RegistrationAPI.getRegistrationCountForSlugs(
        slugs,
        process.env.BACKEND_URL ?? 'http://localhost:8080',
    );

    const props: Props = {
        events: eventsResponse,
        bedpresses: bedpressesResponse,
        registrationCounts: isErrorMessage(registrationCountsResponse) ? [] : registrationCountsResponse,
    };

    return { props };
};

export default HappeningsOverviewPage;
