import React from 'react';
import { useRouter } from 'next/router';
import { Box, Text, Flex, Center, SimpleGrid, Grid, GridItem, Image, Heading } from '@chakra-ui/react';
import { CgProfile } from 'react-icons/cg';
import { BiCalendar } from 'react-icons/bi';
import { ImTicket, ImLocation } from 'react-icons/im';
import Markdown from 'markdown-to-jsx';
import moment from 'moment';

import Layout from '../../components/layout';
import SEO from '../../components/seo';
import MapMarkdownChakra from '../../markdown';
import { Event } from '../../lib';

const EventPage = ({ evnt, error }: { evnt?: Event; error?: string }): JSX.Element => {
    const router = useRouter();

    return (
        <Layout>
            {router.isFallback && <Text>Loading...</Text>}
            {!router.isFallback && !evnt && <Text>Event not found</Text>}
            {error && !router.isFallback && <Text>{error}</Text>}
            {evnt && !router.isFallback && !error && (
                <>
                    <SEO title={evnt.title} />
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
                                bg="gray.900"
                            >
                                <Grid templateColumns="min-content auto" gap="3" alignItems="center" mb="6">
                                    <ImTicket size="2em" />
                                    <Text>{evnt.spots} plasser</Text>
                                    <BiCalendar size="2em" />
                                    <Text>{moment(evnt.date).format('DD. MMM YYYY')}</Text>
                                    <ImLocation size="2em" />
                                    <Text>{evnt.location}</Text>
                                </Grid>
                                <Center bg="gray.800" pb="2" pt="2" borderRadius="0.75em">
                                    <Heading>PÅMELDING</Heading>
                                </Center>
                            </GridItem>
                            <GridItem colStart={2} colSpan={3} rowSpan={2}>
                                <Box
                                    borderWidth="1px"
                                    borderRadius="0.75em"
                                    overflow="hidden"
                                    pl="6"
                                    pr="6"
                                    bg="gray.900"
                                >
                                    <Markdown options={MapMarkdownChakra}>{evnt.body}</Markdown>
                                </Box>
                            </GridItem>
                            <GridItem colSpan={1}>
                                <Box borderWidth="1px" borderRadius="0.75em" overflow="hidden" bg="gray.900">
                                    <Image src={evnt.imageUrl} alt="logo" />
                                </Box>
                            </GridItem>
                        </Grid>
                    </Box>
                </>
            )}
        </Layout>
    );
};

const GET_EVENTS = `
    query {
        eventCollection(limit: 10) {
            items {
                slug
            }
        }
    }
`;

const GET_EVENT_BY_SLUG = `
    query ($slug: String!) {
        eventCollection(where: { slug: $slug }) {
            items {
                title
                slug
                date
                spots
                body
                image {
                    url
                }
                location
                sys {
                    firstPublishedAt
                }
                author {
                    authorName
                }
            }
        }
    }
`;

export const getStaticPaths = async () => {
    const res = await fetch(`https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CONTENTFUL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
            query: GET_EVENTS,
        }),
    });

    const json = await res.json();
    const paths = json.data.eventCollection.items.map((event: { slug: any }) => ({
        params: {
            slug: event.slug,
        },
    }));

    return { paths, fallback: true };
};

export const getStaticProps = async ({ params }: { params: { slug: string } }) => {
    const res = await fetch(`https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CONTENTFUL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
            query: GET_EVENT_BY_SLUG,
            variables: {
                slug: params.slug,
            },
        }),
    });

    if (res.ok) {
        const rawEvent = await res.json();

        if (rawEvent.data.eventCollection.items.length <= 0) {
            return {
                props: {
                    event: null,
                },
            };
        }

        const formattedEvent = {
            title: rawEvent.data.eventCollection.items[0].title,
            slug: rawEvent.data.eventCollection.items[0].slug,
            date: rawEvent.data.eventCollection.items[0].date,
            spots: rawEvent.data.eventCollection.items[0].spots,
            body: rawEvent.data.eventCollection.items[0].body,
            imageUrl: rawEvent.data.eventCollection.items[0].image.url,
            location: rawEvent.data.eventCollection.items[0].location,
            publishedAt: rawEvent.data.eventCollection.items[0].sys.firstPublishedAt,
            author: rawEvent.data.eventCollection.items[0].author,
        };

        return { props: { evnt: formattedEvent }, revalidate: 1 };
    }

    return {
        props: {
            error: 'An error has occured, please try again later.',
        },
    };
};

EventPage.defaultProps = {
    evnt: {
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
