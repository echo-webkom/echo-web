import fs from 'fs';
import { Grid, GridItem, useBreakpointValue, VStack } from '@chakra-ui/react';
import { isBefore, isFuture } from 'date-fns';
import { GetStaticProps } from 'next';
import React from 'react';
import EntryBox from '../components/entry-box';
import Hsp from '../components/hsp';
import SEO from '../components/seo';
import { HappeningAPI, Happening, HappeningType, Post, PostAPI, isErrorMessage } from '../lib/api';
import getRssXML from '../lib/generate-rss-feed';

const IndexPage = ({
    bedpreses,
    posts,
    events,
}: {
    bedpreses: Array<Happening>;
    posts: Array<Post>;
    events: Array<Happening>;
}): JSX.Element => {
    return (
        <>
            <SEO title="echo – Fagutvalget for informatikk" />
            <VStack spacing="5" mb="5">
                <Grid w="100%" gap={5} templateColumns={['1', null, null, 'repeat(2, 1fr)']}>
                    <GridItem>
                        <Hsp />
                    </GridItem>
                    <GridItem rowSpan={2}>
                        <EntryBox
                            titles={[
                                'Bedpres',
                                'Bedpresolini',
                                'Bedriftspresentasjoner',
                                'Bedpres',
                                'Bedriftspresentasjoner',
                            ]}
                            entries={bedpreses}
                            entryLimit={4}
                            altText="Ingen kommende bedriftspresentasjoner :("
                            linkTo="/bedpres"
                            type="bedpres"
                        />
                    </GridItem>
                    <GridItem>
                        <EntryBox
                            title="Arrangementer"
                            entries={events}
                            entryLimit={6}
                            altText="Ingen kommende arrangementer :("
                            linkTo="/event"
                            type="event"
                        />
                    </GridItem>
                </Grid>
                <EntryBox
                    titles={['Innlegg']}
                    entries={posts}
                    entryLimit={useBreakpointValue([3, 3, 3, 2, 2, 3, 4])}
                    altText="Ingen innlegg :("
                    linkTo="/posts"
                    type="post"
                />
            </VStack>
        </>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const bedpresesResponse = await HappeningAPI.getHappeningsByType(0, HappeningType.BEDPRES);
    const eventsResponse = await HappeningAPI.getHappeningsByType(0, HappeningType.EVENT);
    const postsResponse = await PostAPI.getPosts(0);

    if (isErrorMessage(bedpresesResponse)) throw new Error(bedpresesResponse.message);
    if (isErrorMessage(eventsResponse)) throw new Error(eventsResponse.message);
    if (isErrorMessage(postsResponse)) throw new Error(postsResponse.message);

    const rss = getRssXML(postsResponse, [...eventsResponse, ...bedpresesResponse]);

    fs.writeFileSync('./public/rss.xml', rss);

    return {
        props: {
            bedpreses: bedpresesResponse
                .filter((bedpres: Happening) => {
                    return isBefore(new Date().setHours(0, 0, 0, 0), new Date(bedpres.date));
                })
                .slice(0, 4),
            posts: postsResponse.slice(0, 3),
            events: eventsResponse.filter((event: Happening) => isFuture(new Date(event.date))).slice(0, 8),
        },
    };
};

export default IndexPage;
