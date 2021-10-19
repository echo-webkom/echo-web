import { Stack, StackDivider } from '@chakra-ui/react';
import React from 'react';
import { Happening, Post, JobAdvert } from '../lib/api';
import BedpresPreview from './bedpres-preview';
import EventPreview from './event-preview';
import PostPreview from './post-preview';
import JobAdvertPreview from './job-advert-preview';

interface Props {
    entries: Array<Happening | Post | JobAdvert>;
    entryLimit?: number;
    type: 'event' | 'bedpres' | 'post' | 'job-advert';
}

const EntryList = ({ entries, entryLimit, type }: Props): JSX.Element => {
    if (entryLimit) {
        entries = entries.length > entryLimit ? entries.slice(0, entryLimit) : entries;
    }

    return (
        <Stack
            w="100%"
            spacing={5}
            divider={<StackDivider />}
            direction={type === 'post' ? ['column', null, null, 'row'] : 'column'}
            justifyContent="space-around"
        >
            {entries.map((entry: Happening | Post | JobAdvert) => {
                switch (type) {
                    case 'bedpres':
                        return (
                            <BedpresPreview key={entry.slug} bedpres={entry as Happening} data-testid={entry.slug} />
                        );
                    case 'event':
                        return <EventPreview key={entry.slug} event={entry as Happening} />;
                    case 'post':
                        return <PostPreview key={entry.slug} post={entry as Post} />;
                    case 'job-advert':
                        return <JobAdvertPreview key={entry.slug} jobAdvert={entry as JobAdvert} />;
                }
            })}
        </Stack>
    );
};

export default EntryList;
