import { Center, GridItem, Heading, SimpleGrid, Stack, StackDivider, Text } from '@chakra-ui/react';
import React from 'react';
import { Bedpres } from '../lib/api/bedpres';
import { Event } from '../lib/api/event';
import BedpresPreview from './bedpres-preview';
import ContentBox from './content-box';
import EventPreview from './event-preview';

const EntryList = ({ entries, type }: { entries: Array<Bedpres | Event>; type: 'event' | 'bedpres' }) => {
    return (
        <Stack spacing={5} divider={<StackDivider />}>
            {entries.map((event: Event | Bedpres) => {
                return type === 'bedpres' ? (
                    <BedpresPreview key={event.slug} bedpres={event as Bedpres} data-testid={event.slug} />
                ) : (
                    <EventPreview key={event.slug} event={event as Event} />
                );
            })}
        </Stack>
    );
};

export default EntryList;
