import { GridItem, Heading, SimpleGrid } from '@chakra-ui/react';
import { type Happening, HappeningAPI } from '@api/happening';
import { RegistrationAPI, type RegistrationCount } from '@api/registration';
import SEO from '@components/seo';
import { isErrorMessage } from '@utils/error';
import EventOverview from '@components/event-overview';
import EventCalendar from '@components/event-calendar';

interface Props {
    events: Array<Happening>;
    bedpresses: Array<Happening>;
    registrationCounts: Array<RegistrationCount>;
}

const HappeningsPage = ({ events, bedpresses, registrationCounts }: Props): JSX.Element => {
    const breakpoints = [1, null, null, null, 2];
    const happenings = [...events, ...bedpresses];

    return (
        <>
            <SEO title="Arrangementer" />
            <Heading>Arrangementer</Heading>
            <SimpleGrid columns={breakpoints} gap="6">
                <GridItem colSpan={breakpoints}>
                    <EventCalendar happenings={happenings} />
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

export const getStaticProps = async () => {
    const eventsResponse = await HappeningAPI.getHappeningsByType(0, 'EVENT');
    const bedpressesResponse = await HappeningAPI.getHappeningsByType(0, 'BEDPRES');

    if (isErrorMessage(eventsResponse)) throw new Error(eventsResponse.message);
    if (isErrorMessage(bedpressesResponse)) throw new Error(bedpressesResponse.message);

    const slugs = [...bedpressesResponse, ...eventsResponse].map((happening: Happening) => happening.slug);
    const registrationCountsResponse = await RegistrationAPI.getRegistrationCountForSlugs(
        slugs,
        process.env.BACKEND_URL ?? 'http://localhost:8080',
    );

    return {
        props: {
            events: eventsResponse,
            bedpresses: bedpressesResponse,
            registrationCounts: isErrorMessage(registrationCountsResponse) ? [] : registrationCountsResponse,
        },
    };
};

export default HappeningsPage;
