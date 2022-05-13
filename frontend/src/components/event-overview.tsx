import { Box, Heading, HStack, Text } from '@chakra-ui/react';
import { isFuture, isPast } from 'date-fns';
import { useState } from 'react';
import { Happening } from '../lib/api';
import EntryBox from './entry-box';

interface Props {
    events: Array<Happening>;
    title: string;
}

const EventOverview = ({ title, events }: Props) => {
    const [time, setTime] = useState('upcoming');

    const upcoming = events.filter((entry: Happening) => {
        return isFuture(new Date(entry.date));
    });
    const past = events
        .filter((entry: Happening) => {
            return isPast(new Date(entry.date));
        })
        .reverse();

    return (
        <Box>
            <Heading>{title}</Heading>
            <HStack gap="3" mb="2">
                <Text
                    onClick={() => setTime('past')}
                    borderBottom="2px solid"
                    borderColor={time === 'past' ? 'cyan.500' : 'transparent'}
                    _hover={{ cursor: 'pointer' }}
                >
                    Tidligere
                </Text>
                <Text
                    onClick={() => setTime('upcoming')}
                    borderBottom="2px solid transparent"
                    borderColor={time === 'upcoming' ? 'cyan.500' : 'transparent'}
                    _hover={{ cursor: 'pointer' }}
                >
                    Kommende
                </Text>
            </HStack>
            {time === 'upcoming' ? (
                <EntryBox entries={upcoming} type="event" />
            ) : (
                <EntryBox entries={past} type="event" />
            )}
        </Box>
    );
};

export default EventOverview;
