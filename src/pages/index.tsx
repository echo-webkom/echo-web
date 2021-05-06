import React from 'react';
import { GetStaticProps } from 'next';
import fs from 'fs';

import { SimpleGrid, Stack, GridItem } from '@chakra-ui/react';
import { isBefore, isFuture } from 'date-fns';
import getRssXML from '../lib/generateRssFeed';
import Layout from '../components/layout';

import SEO from '../components/seo';
import { Bedpres, BedpresAPI } from '../lib/api/bedpres';
import { Post, PostAPI } from '../lib/api/post';
import { Event, EventAPI } from '../lib/api/event';
import PostBlock from '../components/post-block';
import ErrorBox from '../components/error-box';
import Hsp from '../components/hsp';
import EntryBox from '../components/entry-box';

const IndexPage = ({
    bedpreses,
    bedpresError,
    posts,
    postsError,
    events,
    eventsError,
}: {
    bedpreses: Array<Bedpres>;
    bedpresError: string;
    posts: Array<Post>;
    postsError: string;
    events: Array<Event>;
    eventsError: string;
}): JSX.Element => {
    return (
        <Layout>
            <SEO title="Hjem" />
            <SimpleGrid columns={[1, null, null, 2]} spacing="5" mb="5">
                <GridItem rowStart={[2, null, null, 1]}>
                    <Stack minW="0" spacing="5">
                        <Hsp />
                        <EntryBox
                            title="Arrangementer"
                            entries={events}
                            error={eventsError}
                            altText="Ingen kommende arrangementer :("
                            linkTo="/events"
                            type="event"
                        />
                    </Stack>
                </GridItem>
                <GridItem>
                    <EntryBox
                        titles={[
                            'Bedpres',
                            'Bedpresolini',
                            'Bedriftspresentasjoner',
                            'Bedpres',
                            'Bedriftspresentasjoner',
                        ]}
                        entries={bedpreses}
                        error={bedpresError}
                        altText="Ingen kommende bedriftspresentasjoner :("
                        linkTo="/bedpres"
                        type="bedpres"
                    />
                </GridItem>
                <GridItem colSpan={[1, null, null, 2]}>
                    {!posts && postsError && <ErrorBox error={postsError} />}
                    {posts && !postsError && <PostBlock posts={posts} error={postsError} />}
                </GridItem>
            </SimpleGrid>
        </Layout>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const bedpresesResponse = await BedpresAPI.getBedpreses(0);
    const postsResponse = await PostAPI.getPosts(0);
    const eventsResponse = await EventAPI.getEvents(0);

    const rss = getRssXML(postsResponse.posts, eventsResponse.events, bedpresesResponse.bedpreses);

    fs.writeFileSync('./public/rss.xml', rss);

    return {
        props: {
            bedpreses:
                bedpresesResponse.bedpreses
                    ?.filter((bedpres: Bedpres) => {
                        return isBefore(new Date().setHours(0, 0, 0, 0), new Date(bedpres.date));
                    })
                    .slice(0, 3) || null,
            bedpresError: bedpresesResponse.error,
            posts: postsResponse.posts?.slice(0, 3) || null,
            postsError: postsResponse.error,
            events: eventsResponse.events?.filter((event: Event) => isFuture(new Date(event.date))).slice(0, 4) || null,
            eventsError: eventsResponse.error,
        },
    };
};

export default IndexPage;
