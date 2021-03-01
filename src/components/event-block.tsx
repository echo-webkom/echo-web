import React from 'react';
import { Box, SimpleGrid, Center, Text, Flex, Image, useColorModeValue } from '@chakra-ui/react';
import { BiCalendar } from 'react-icons/bi';
import { ImLocation, ImTicket } from 'react-icons/im';
import { format } from 'date-fns';

import { Event } from '../lib/types';

const publishedAtStr = (publishedAt: string): string => {
    try {
        return format(new Date(publishedAt), 'PPP');
    } catch (error) {
        return 'Ugyldig dato';
    }
};

const EventBox = ({ event }: { event: Event }): JSX.Element => {
    const boxBg = useColorModeValue('gray.100', 'gray.900');

    return (
        <Box borderWidth="1px" borderRadius="0.75em" pl="6" pr="6" bg={boxBg} padding="2em">
            <SimpleGrid columns={2}>
                <SimpleGrid rows={2}>
                    <Flex>
                        <Text fontSize="4xl" fontWeight="bold">
                            {event.title}
                        </Text>
                    </Flex>
                    <SimpleGrid rows={3}>
                        <Flex pt="0.5em">
                            <BiCalendar size="2em" />
                            <Text pl="0.5em">{publishedAtStr(event.publishedAt)}</Text>
                        </Flex>
                        <Flex pt="0.5em">
                            <ImLocation size="2em" />
                            <Text pl="0.5em">{event.location}</Text>
                        </Flex>
                        <Flex pt="0.5em">
                            <ImTicket size="2em" />
                            {event.spots === 0 ? (
                                <Text pl="0.5em">Ubegrensede plasser</Text>
                            ) : (
                                <Text pl="0.5em">{event.spots} plasser</Text>
                            )}
                        </Flex>
                    </SimpleGrid>
                </SimpleGrid>
                <Image width="300px" src={event.imageUrl} alt="Bilde" />
            </SimpleGrid>
        </Box>
    );
};

const EventBlock = ({ events }: { events: Array<Event> }): JSX.Element => {
    return (
        <Center>
            <Box pt="100px" w="900px" data-testid="event-block">
                <Box border="5px">
                    <SimpleGrid p="50px" spacing={10}>
                        {events.map((event: Event) => {
                            return <EventBox key={event.slug} event={event} />;
                        })}
                    </SimpleGrid>
                </Box>
            </Box>
        </Center>
    );
};

export default EventBlock;
