import { Box, Heading, Tab, TabList, TabPanels, Tabs } from '@chakra-ui/react';
import { isFuture, isPast } from 'date-fns';
import { useContext } from 'react';
import EventOverviewTab from './event-overview-tab';
import type { RegistrationCount } from '@api/registration';
import type { Happening } from '@api/happening';
import LanguageContext from 'language-context';

interface Props {
    events: Array<Happening>;
    title: string;
    type: 'bedpres' | 'event';
    registrationCounts: Array<RegistrationCount>;
}

const EventOverview = ({ title, events, type, registrationCounts }: Props) => {
    const isNorwegian = useContext(LanguageContext);

    // Amount of previews to be diplayed in each tab
    const n = type === 'bedpres' ? 3 : 5;

    const upcomingEvents = events.filter((event) => isFuture(new Date(event.date)));
    const pastEvents = events.filter((event) => isPast(new Date(event.date))).reverse();

    return (
        <Box>
            <Heading>{title}</Heading>

            <Tabs defaultIndex={1} isFitted isLazy>
                <TabList>
                    <Tab>{isNorwegian ? 'Tidligere' : 'Past'}</Tab>
                    <Tab>{isNorwegian ? 'Kommende' : 'Upcoming'}</Tab>
                </TabList>

                <TabPanels>
                    <EventOverviewTab
                        happenings={pastEvents}
                        type={type}
                        registrationCounts={registrationCounts}
                        previewPerPage={n}
                    />
                    <EventOverviewTab
                        happenings={upcomingEvents}
                        type={type}
                        registrationCounts={registrationCounts}
                        previewPerPage={n}
                    />
                </TabPanels>
            </Tabs>
        </Box>
    );
};

export default EventOverview;
