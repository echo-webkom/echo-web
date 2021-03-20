import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { useRouter } from 'next/router';
import { Box, Text, Grid, GridItem, Image, Heading } from '@chakra-ui/react';
import { BiCalendar } from 'react-icons/bi';
import { ImTicket, ImLocation } from 'react-icons/im';
import Markdown from 'markdown-to-jsx';
import { format, parseISO } from 'date-fns';

import Layout from '../../components/layout';
import SEO from '../../components/seo';
import MapMarkdownChakra from '../../markdown';
import { Event } from '../../lib/types';

import { EventAPI } from '../../lib/api';
import ContentBox from '../../components/content-box';

const EventPage = ({ event, error }: { event?: Event; error?: string }): JSX.Element => {
    const router = useRouter();

    return (
        <Layout>
            {router.isFallback && <Text>Loading...</Text>}
            {!router.isFallback && !event && <Text>Event not found</Text>}
            {error && !router.isFallback && <Text>{error}</Text>}
            {event && !router.isFallback && !error && (
                <>
                    <SEO title={event.title} />
                    <Box>
                        <Grid templateColumns={['repeat(1, 1fr)', null, null, 'repeat(4, 1fr)']} gap="4">
                            <GridItem as={ContentBox} colSpan={1}>
                                <Grid templateColumns="min-content auto" gap="3" alignItems="center">
                                    <ImTicket size="2em" />
                                    <Text>{event.spots} plasser</Text>
                                    <BiCalendar size="2em" />
                                    <Text>{format(parseISO(event.date), 'dd. MMM yyyy')}</Text>
                                    <ImLocation size="2em" />
                                    <Text>{event.location}</Text>
                                </Grid>
                            </GridItem>
                            <GridItem
                                colStart={[1, null, null, 2]}
                                rowStart={[2, null, null, 1]}
                                colSpan={[1, null, null, 3]}
                                rowSpan={2}
                            >
                                <ContentBox>
                                    <Heading mb="0.5em" mt="0.5em">
                                        {event.title}
                                    </Heading>
                                    <Markdown options={MapMarkdownChakra}>{event.body}</Markdown>
                                </ContentBox>
                            </GridItem>
                            <GridItem colSpan={1}>
                                <ContentBox noPadding>
                                    <Image src={event.imageUrl} alt="logo" />
                                </ContentBox>
                            </GridItem>
                        </Grid>
                    </Box>
                </>
            )}
        </Layout>
    );
};

export const getStaticPaths: GetStaticPaths = async () => {
    const paths = await EventAPI.getPaths();
    return {
        paths: paths.map((slug: string) => ({
            params: {
                slug,
            },
        })),
        fallback: true,
    };
};

interface Params extends ParsedUrlQuery {
    slug: string;
}

export const getStaticProps: GetStaticProps = async (context) => {
    const { slug } = context.params as Params;
    const { event, error } = await EventAPI.getEventBySlug(slug);

    return {
        props: {
            event,
            error,
        },
    };
};

EventPage.defaultProps = {
    event: {
        title: 'title',
        slug: 'slug',
        date: '2020-01-01T00:00:00.000Z',
        spots: 0,
        body: '',
        imageUrl: '',
        publishedAt: '2020-01-01T00:00:00.000Z',
        author: {
            authorName: 'Author McAuthor',
        },
    },
    error: '',
};

export default EventPage;
