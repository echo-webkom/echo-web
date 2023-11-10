import { Stack, StackDivider } from '@chakra-ui/react';
import type { Happening } from '@api/happening';
import type { Post } from '@api/post';
import type { JobAdvert } from '@api/job-advert';
import type { RegistrationCount } from '@api/registration';
import BedpresPreview from '@components/bedpres-preview';
import EventPreview from '@components/event-preview';
import PostPreview from '@components/post-preview';
import JobAdvertPreview from '@components/job-advert-preview';

interface Props {
    entries: Array<Happening | Post | JobAdvert>;
    entryLimit?: number;
    type: 'event' | 'bedpres' | 'post' | 'job-advert';
    registrationCounts?: Array<RegistrationCount>;
}

const EntryList = ({ entries, entryLimit, type, registrationCounts }: Props) => {
    const enableJobAdverts = process.env.NEXT_PUBLIC_ENABLE_JOB_ADVERTS?.toLowerCase() === 'true';

    if (entryLimit) {
        entries = entries.length > entryLimit ? entries.slice(0, entryLimit) : entries;
    }

    if (type === 'job-advert') {
        entries.sort((a, b) => {
            return (b as JobAdvert).weight - (a as JobAdvert).weight;
        });
    }

    return (
        <Stack
            w="100%"
            spacing={type === 'post' && enableJobAdverts ? 12 : 6}
            divider={<StackDivider />}
            direction={type === 'post' && !enableJobAdverts ? ['column', null, null, 'row'] : 'column'}
            justifyContent="space-around"
        >
            {entries.map((entry: Happening | Post | JobAdvert) => {
                switch (type) {
                    case 'bedpres': {
                        return (
                            <BedpresPreview
                                key={entry.slug}
                                bedpres={entry as Happening}
                                data-testid={entry.slug}
                                registrationCounts={registrationCounts}
                            />
                        );
                    }
                    case 'event': {
                        return (
                            <EventPreview
                                key={entry.slug}
                                event={entry as Happening}
                                registrationCounts={registrationCounts}
                            />
                        );
                    }
                    case 'post': {
                        return (
                            <PostPreview
                                key={entry.slug}
                                post={entry as Post}
                                w={enableJobAdverts ? '100%' : undefined}
                            />
                        );
                    }
                    case 'job-advert': {
                        return <JobAdvertPreview key={entry.slug} jobAdvert={entry as JobAdvert} />;
                    }
                }
            })}
        </Stack>
    );
};

export default EntryList;
