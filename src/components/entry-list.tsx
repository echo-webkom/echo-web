import { Stack, StackDivider } from '@chakra-ui/react';
import React from 'react';
import { Bedpres } from '../lib/api/bedpres';
import { Event } from '../lib/api/event';
import BedpresPreview from './bedpres-preview';
import EventPreview from './event-preview';

interface Props {
    entries: Array<Bedpres | Event>;
    type: 'event' | 'bedpres';
}

const EntryList = ({ entries, type }: Props): JSX.Element => {
    return (
        <Stack spacing={5} divider={<StackDivider />}>
            {entries.map((entry: Event | Bedpres) => {
                return type === 'bedpres' ? (
                    <BedpresPreview key={entry.slug} bedpres={entry as Bedpres} data-testid={entry.slug} />
                ) : (
                    <EventPreview key={entry.slug} event={entry as Event} />
                );
            })}
        </Stack>
    );
};

export default EntryList;
