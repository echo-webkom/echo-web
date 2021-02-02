import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { useRouter } from 'next/router';
import { Box, Text, Button, Grid, GridItem, Image, Heading, useColorModeValue } from '@chakra-ui/react';
import { BiCalendar } from 'react-icons/bi';
import { ImTicket, ImLocation } from 'react-icons/im';
import Markdown from 'markdown-to-jsx';
import moment from 'moment';

import Layout from '../../components/layout';
import SEO from '../../components/seo';
import MapMarkdownChakra from '../../markdown';
import { Event } from '../../lib';

import EventAPI from '../../lib/api/event';

const EventPage = ({ event, error }: { event?: Event; error?: string }): JSX.Element => {
    const router = useRouter();
    const boxBg = useColorModeValue('gray.100', 'gray.900');
    const buttonBg = useColorModeValue('gray.200', 'gray.800');
    const buttonHoverBg = useColorModeValue('gray.300', 'gray.700');

    return (
        <Layout>
            {router.isFallback && <Text>Loading...</Text>}
            {!router.isFallback && !event && <Text>Event not found</Text>}
            {error && !router.isFallback && <Text>{error}</Text>}
            {event && !router.isFallback && !error && (
                <>
                    <SEO title={event.title} />
                    <Box>
                        <Grid templateRows="repeat(2, 1fr)" templateColumns="repeat(4, minmax(0, 1fr))" gap="4">
                            <GridItem
                                colSpan={1}
                                borderWidth="1px"
                                borderRadius="0.75em"
                                overflow="hidden"
                                pl="6"
                                pr="6"
                                pt="6"
                                pb="6"
                                bg={boxBg}
                            >
                                <Grid templateColumns="min-content auto" gap="3" alignItems="center" mb="6">
                                    <ImTicket size="2em" />
                                    <Text>{event.spots} plasser</Text>
                                    <BiCalendar size="2em" />
                                    <Text>{moment(event.date).format('DD. MMM YYYY')}</Text>
                                    <ImLocation size="2em" />
                                    <Text>{event.location}</Text>
                                </Grid>
                                <Button
                                    w="100%"
                                    h="4em"
                                    bg={buttonBg}
                                    _hover={{ bg: buttonHoverBg }}
                                    borderRadius="0.75em"
                                >
                                    <Heading>PÅMELDING</Heading>
                                </Button>
                            </GridItem>
                            <GridItem colStart={2} colSpan={3} rowSpan={2}>
                                <Box borderWidth="1px" borderRadius="0.75em" overflow="hidden" pl="6" pr="6" bg={boxBg}>
                                    <Markdown options={MapMarkdownChakra}>{event.body}</Markdown>
                                </Box>
                            </GridItem>
                            <GridItem colSpan={1}>
                                <Box borderWidth="1px" borderRadius="0.75em" overflow="hidden" bg="gray.900">
                                    <Image src={event.imageUrl} alt="logo" />
                                </Box>
                            </GridItem>
                        </Grid>
                    </Box>
                </>
            )}
        </Layout>
    );
};

export const getStaticPaths: GetStaticPaths = async () => {
    try {
        const { data } = await EventAPI.getPaths();

        const paths = data.data.eventCollection.items.map((event: { slug: string }) => ({
            params: {
                slug: event.slug,
            },
        }));

        return { paths, fallback: true };
    } catch (error) {
        return { paths: [], fallback: true };
    }
};

interface Params extends ParsedUrlQuery {
    slug: string;
}

export const getStaticProps: GetStaticProps = async (context) => {
    const { slug } = context.params as Params;

    try {
        const { data } = await EventAPI.getEventBySlug(slug);
        return {
            props: {
                event: {
                    title: data?.data.eventCollection.items[0].title,
                    slug: data?.data.eventCollection.items[0].slug,
                    date: data?.data.eventCollection.items[0].date,
                    spots: data?.data.eventCollection.items[0].spots,
                    body: data?.data.eventCollection.items[0].body,
                    imageUrl: data?.data.eventCollection.items[0].image.url,
                    location: data?.data.eventCollection.items[0].location,
                    publishedAt: data?.data.eventCollection.items[0].sys.firstPublishedAt,
                    author: data?.data.eventCollection.items[0].author,
                },
                error: null,
            },
            revalidate: 1,
        };
    } catch (error) {
        return {
            props: {
                event: {},
                error: `Event '${slug}' not found`,
            },
            revalidate: 1,
        };
    }
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
