import { Stack, StackDivider } from '@chakra-ui/react';
import React from 'react';
import { Bedpres } from '../lib/api/bedpres';
import { Event } from '../lib/api/event';
import { Post } from '../lib/api/post';
import BedpresPreview from './bedpres-preview';
import EventPreview from './event-preview';
import PostPreview from './post-preview';

interface Props {
    entries: Array<Bedpres | Event | Post>;
    entryLimit?: number;
    type: 'event' | 'bedpres' | 'post';
    direction: 'column' | 'row';
}

const EntryList = ({ entries, entryLimit, type, direction }: Props): JSX.Element => {
    if (entryLimit) {
        entries = entries.length > entryLimit ? entries.slice(0, entryLimit) : entries;
    }
    return (
        <Stack spacing={5} divider={<StackDivider />} direction={direction} justifyContent="space-around">
            {entries.map((entry: Event | Bedpres | Post) => {
                switch (type) {
                    case 'bedpres':
                        return <BedpresPreview key={entry.slug} bedpres={entry as Bedpres} data-testid={entry.slug} />;
                    case 'event':
                        return <EventPreview key={entry.slug} event={entry as Event} />;
                    case 'post':
                        return <PostPreview key={entry.slug} post={entry as Post} />;
                }
            })}
        </Stack>
    );
};

EntryList.defaultProps = {
    direction: 'column',
};

export default EntryList;
