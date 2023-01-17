import { GridItem, Heading, SimpleGrid } from '@chakra-ui/react';
import { type Happening, HappeningAPI } from '@api/happening';
import { RegistrationAPI, type RegistrationCount } from '@api/registration';
import SEO from '@components/seo';
import Section from '@components/section';
import { isErrorMessage } from '@utils/error';
import EventOverview from '@components/event-overview';
import EventCalendar from '@components/event-calendar';
import useLanguage from '@hooks/use-language';

interface Props {
    events: Array<Happening>;
    bedpresses: Array<Happening>;
    registrationCounts: Array<RegistrationCount>;
}

const HappeningsPage = ({ events, bedpresses, registrationCounts }: Props) => {
    const isNorwegian = useLanguage();

    const breakpoints = [1, null, null, null, 2];
    const happenings = [...events, ...bedpresses];

    return (
        <>
            <SEO title="Arrangementer" />
            <SimpleGrid columns={breakpoints} gap="6">
                <GridItem as={Section} colSpan={breakpoints}>
                    <Heading>{isNorwegian ? 'Kalender' : 'Calendar'}</Heading>
                    <EventCalendar happenings={happenings} />
                </GridItem>
                <GridItem>
                    <EventOverview
                        title={isNorwegian ? 'Arrangementer' : 'Events'}
                        events={events}
                        registrationCounts={registrationCounts}
                        type="event"
                    />
                </GridItem>
                <GridItem>
                    <EventOverview
                        title={isNorwegian ? 'Bedriftspresentasjoner' : 'Company Presentations'}
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
    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey) throw new Error('No ADMIN_KEY defined.');

    const eventsResponse = await HappeningAPI.getHappeningsByType(0, 'EVENT');
    const bedpressesResponse = await HappeningAPI.getHappeningsByType(0, 'BEDPRES');

    if (isErrorMessage(eventsResponse)) throw new Error(eventsResponse.message);
    if (isErrorMessage(bedpressesResponse)) throw new Error(bedpressesResponse.message);

    const slugs = [...bedpressesResponse, ...eventsResponse].map((happening: Happening) => happening.slug);
    const registrationCountsResponse = await RegistrationAPI.getRegistrationCountForSlugs(slugs, adminKey);

    return {
        props: {
            events: eventsResponse,
            bedpresses: bedpressesResponse,
            registrationCounts: isErrorMessage(registrationCountsResponse) ? [] : registrationCountsResponse,
        },
        revalidate: 60,
    };
};

export default HappeningsPage;
