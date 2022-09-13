import { Box, Heading, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { isFuture, isPast } from 'date-fns';
import EntryBox from './entry-box';
import type { RegistrationCount } from '@api/registration';
import type { Happening } from '@api/happening';

interface Props {
    events: Array<Happening>;
    title: string;
    type: 'bedpres' | 'event';
    registrationCounts: Array<RegistrationCount>;
}

const EventOverview = ({ title, events, type, registrationCounts }: Props) => {
    const upcoming = events.filter((entry: Happening) => isFuture(new Date(entry.date)));
    const past = events.filter((entry: Happening) => isPast(new Date(entry.date))).reverse();

    return (
        <Box>
            <Heading>{title}</Heading>

            <Tabs defaultIndex={1} isFitted isLazy>
                <TabList>
                    <Tab>Tidligere</Tab>
                    <Tab>Kommende</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel px="0">
                        <EntryBox
                            entries={past}
                            type={type}
                            altText={
                                type === 'bedpres'
                                    ? 'Ingen flere bedriftpresentasjoner :('
                                    : 'Ingen flere arrangement :('
                            }
                            registrationCounts={registrationCounts}
                        />
                    </TabPanel>
                    <TabPanel px="0">
                        <EntryBox
                            entries={upcoming}
                            type={type}
                            altText={
                                type === 'bedpres'
                                    ? 'Ingen flere bedriftpresentasjoner :('
                                    : 'Ingen flere arrangement :('
                            }
                            registrationCounts={registrationCounts}
                        />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
};

export default EventOverview;
