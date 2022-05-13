import { GridItem, Heading, SimpleGrid } from '@chakra-ui/react';
import { GetStaticProps } from 'next';
import EventCalendar from '../../components/event-calendar';
import EventOverview from '../../components/event-overview';
import SEO from '../../components/seo';
import { Happening, HappeningAPI, HappeningType, isErrorMessage } from '../../lib/api';

interface Props {
    events: Array<Happening>;
}
const HappeningsOverviewPage = ({ events }: Props): JSX.Element => {
    return (
        <>
            <SEO title="Arrangementer" />
            <Heading>Arrangementer</Heading>
            <SimpleGrid columns={2} gap="6">
                <GridItem colSpan={2}>
                    <EventCalendar events={events} />
                </GridItem>
                <GridItem>
                    <EventOverview title="Bedriftspresentasjon" events={events} />
                </GridItem>
                <GridItem>
                    <EventOverview title="Bedriftspresentasjon" events={events} />
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

    const props: Props = {
        events: [...eventsResponse, ...bedpressesResponse],
    };

    return { props };
};

export default HappeningsOverviewPage;
