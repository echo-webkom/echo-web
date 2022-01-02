import { Stack, StackDivider } from '@chakra-ui/react';
import React from 'react';
import { Happening, Post } from '../lib/api';
import BedpresPreview from './bedpres-preview';
import EventPreview from './event-preview';
import PostPreview from './post-preview';

interface Props {
    entries: Array<Happening | Post>;
    entryLimit?: number;
    type: 'event' | 'bedpres' | 'post';
    direction: 'column' | 'row';
}

const EntryList = ({ entries, entryLimit, type, direction = 'column' }: Props): JSX.Element => {
    if (entryLimit) {
        entries = entries.length > entryLimit ? entries.slice(0, entryLimit) : entries;
    }
    return (
        <Stack spacing={5} divider={<StackDivider />} direction={direction} justifyContent="space-around">
            {entries.map((entry: Happening | Post) => {
                switch (type) {
                    case 'bedpres':
                        return (
                            <BedpresPreview key={entry.slug} bedpres={entry as Happening} data-testid={entry.slug} />
                        );
                    case 'event':
                        return <EventPreview key={entry.slug} event={entry as Happening} />;
                    case 'post':
                        return <PostPreview key={entry.slug} post={entry as Post} />;
                }
            })}
        </Stack>
    );
};

export default EntryList;
