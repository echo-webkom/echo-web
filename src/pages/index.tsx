import React from 'react';
import { GetStaticProps } from 'next';

import {
    SimpleGrid,
    Stack,
    Heading,
    useColorModeValue,
    Center,
    LinkBox,
    LinkOverlay,
    useBreakpointValue,
    GridItem,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import Image from 'next/image';
import { isFuture } from 'date-fns';
import { date } from 'typescript-json-decoder';
import Layout from '../components/layout';

import SEO from '../components/seo';
import BedpresBlock from '../components/bedpres-block';
import { Bedpres, BedpresAPI } from '../lib/api/bedpres';
import { Post, PostAPI } from '../lib/api/post';
import { Event, EventAPI } from '../lib/api/event';
import ContentBox from '../components/content-box';
import EventsBlock from '../components/events-block';
import PostBlock from '../components/post-block';
import ErrorBox from '../components/error-box';

const bekkLogo = '/bekk.png';

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
    const bekkLogoFilter = useColorModeValue('invert(1)', 'invert(0)');
    const hspHeading = useBreakpointValue(['HSP', 'Vibe Partner', 'Hovedsamarbeidspartner']);

    return (
        <Layout>
            <SEO title="Hjem" />
            <SimpleGrid columns={[1, null, null, 2]} spacing="5" mb="5">
                <GridItem rowStart={[2, null, null, 1]}>
                    <Stack minW="0" spacing="5">
                        <ContentBox>
                            <Center minW="0" wordBreak="break-word">
                                <Heading mb=".5em" sizes={['xs', 'md']}>
                                    {hspHeading}
                                </Heading>
                            </Center>
                            <Center>
                                <LinkBox>
                                    <NextLink href="https://bekk.no" passHref>
                                        <LinkOverlay isExternal filter={bekkLogoFilter}>
                                            <Image alt="Bekk" src={bekkLogo} width={300} height={72} />
                                        </LinkOverlay>
                                    </NextLink>
                                </LinkBox>
                            </Center>
                        </ContentBox>
                        <EventsBlock
                            events={events.filter((event: Event) => isFuture(new Date(event.date)))}
                            error={eventsError}
                        />
                    </Stack>
                </GridItem>
                <GridItem>
                    <BedpresBlock bedpreses={bedpreses} error={bedpresError} />
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
    const postsResponse = await PostAPI.getPosts(3);
    const eventsResponse = await EventAPI.getEvents(0);

    return {
        props: {
            bedpreses: bedpresesResponse.bedpreses,
            bedpresError: bedpresesResponse.error,
            posts: postsResponse.posts,
            postsError: postsResponse.error,
            events: eventsResponse.events?.filter((event: Event) => isFuture(new Date(event.date))).slice(0, 4),
            eventsError: eventsResponse.error,
        },
    };
};

export default IndexPage;
