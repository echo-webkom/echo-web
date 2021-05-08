import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { useRouter } from 'next/router';
import { Center, Box, Text, Grid, GridItem, Heading, Icon, Spinner, Divider } from '@chakra-ui/react';
import { BiCalendar } from 'react-icons/bi';
import { ImTicket, ImLocation } from 'react-icons/im';
import Markdown from 'markdown-to-jsx';
import { format, parseISO } from 'date-fns';

import { RiTimeLine } from 'react-icons/ri';
import Layout from '../../components/layout';
import SEO from '../../components/seo';
import MapMarkdownChakra from '../../markdown';
import { EventAPI, Event } from '../../lib/api/event';

import ContentBox from '../../components/content-box';
import ErrorBox from '../../components/error-box';

const EventPage = ({ event, error }: { event: Event; error: string }): JSX.Element => {
    const router = useRouter();

    return (
        <Layout>
            {router.isFallback && (
                <Center>
                    <Spinner />
                </Center>
            )}
            {error && !router.isFallback && !event && <ErrorBox error={error} />}
            {event && !router.isFallback && !error && (
                <>
                    <SEO title={event.title} />
                    <Box>
                        <Grid templateColumns={['repeat(1, 1fr)', null, null, 'repeat(4, 1fr)']} gap="4">
                            <GridItem as={ContentBox} colSpan={1}>
                                <Grid templateColumns="min-content auto" gap="3" alignItems="center">
                                    {event.spots && (
                                        <>
                                            <Icon as={ImTicket} boxSize={10} />
                                            <Text>{event.spots} plasser</Text>
                                        </>
                                    )}
                                    <Icon as={BiCalendar} boxSize={10} />
                                    <Text>{format(parseISO(event.date), 'dd. MMM yyyy')}</Text>
                                    <Icon as={RiTimeLine} boxSize={10} />
                                    <Text>{format(parseISO(event.date), 'HH:mm')}</Text>
                                    <Icon as={ImLocation} boxSize={10} />
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
                                    <Heading mb="0.2em" size="2xl">
                                        {event.title}
                                    </Heading>
                                    <Divider mb="1em" />
                                    <Markdown options={{ overrides: MapMarkdownChakra }}>{event.body}</Markdown>
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

    if (error === '404') {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            event,
            error,
        },
    };
};

export default EventPage;
