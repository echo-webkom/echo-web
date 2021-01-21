import React from 'react';
import { useRouter } from 'next/router';
import { Box, Text, Flex, Center } from '@chakra-ui/react';
import { CgProfile } from 'react-icons/cg';
import { BiCalendar } from 'react-icons/bi';
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
            {!router.isFallback && !evnt && <Text>evnt not found</Text>}
            {error && !router.isFallback && <Text>{error}</Text>}
            {evnt && !router.isFallback && !error && (
                <>
                    <SEO title={evnt.title} />
                    <Box>
                        <Box borderWidth="1px" borderRadius="0.75em" overflow="hidden" pl="6" pr="6" mb="1em">
                            <Markdown options={MapMarkdownChakra}>{evnt.body}</Markdown>
                        </Box>
                        <Flex
                            justifyContent="space-between"
                            display={['block', null, 'flex']}
                            spacing="5"
                            borderWidth="1px"
                            borderRadius="0.75em"
                            overflow="hidden"
                            pl="6"
                            pr="6"
                            pt="1"
                            pb="1"
                        >
                            <Flex>
                                <Center mr="2">
                                    <CgProfile />
                                </Center>
                                <Text>av {evnt.author.authorName}</Text>
                            </Flex>
                            <Flex>
                                <Center mr="2">
                                    <BiCalendar />
                                </Center>
                                <Text>{moment(evnt.publishedAt).format('DD. MMM YYYY')}</Text>
                            </Flex>
                        </Flex>
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
    console.log(params.slug);
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

    console.log(res);

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
            image: rawEvent.data.eventCollection.items[0].image.url,
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
