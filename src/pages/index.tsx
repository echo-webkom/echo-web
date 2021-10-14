import { GridItem, SimpleGrid, Stack, useBreakpointValue } from '@chakra-ui/react';
import { isBefore, isFuture } from 'date-fns';
import fs from 'fs';
import { GetStaticProps } from 'next';
import React from 'react';
import EntryBox from '../components/entry-box';
import Hsp from '../components/hsp';
import Layout from '../components/layout';
import SEO from '../components/seo';
import { Bedpres, BedpresAPI } from '../lib/api/bedpres';
import { Event, EventAPI } from '../lib/api/event';
import { Post, PostAPI } from '../lib/api/post';
import getRssXML from '../lib/generate-rss-feed';

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
            <SEO title="echo – Fagutvalget for informatikk" />
            <SimpleGrid columns={[1, null, null, 2]} spacing="5" mb="5">
                <GridItem rowStart={[2, null, null, 1]}>
                    <Stack minW="0" spacing="5">
                        <Hsp />
                        <EntryBox
                            title="Arrangementer"
                            entries={events}
                            entryLimit={4}
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
                        entryLimit={3}
                        error={bedpresError}
                        altText="Ingen kommende bedriftspresentasjoner :("
                        linkTo="/bedpres"
                        type="bedpres"
                    />
                </GridItem>
                <GridItem colSpan={[1, null, null, 2]}>
                    <EntryBox
                        titles={['Innlegg']}
                        entries={posts}
                        entryLimit={useBreakpointValue([2, 2, 2, 2, 2, 3, 4])}
                        error={postsError}
                        altText="Ingen innlegg :("
                        linkTo="/posts"
                        type="post"
                        direction={useBreakpointValue(['column', 'column', 'column', 'row'])}
                    />
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
                    .slice(0, 6) || null,
            bedpresError: bedpresesResponse.error,
            posts: postsResponse.posts?.slice(0, 6) || null,
            postsError: postsResponse.error,
            events: eventsResponse.events?.filter((event: Event) => isFuture(new Date(event.date))).slice(0, 8) || null,
            eventsError: eventsResponse.error,
        },
    };
};

export default IndexPage;
