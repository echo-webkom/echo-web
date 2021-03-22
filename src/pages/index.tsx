import React from 'react';
import { GetStaticProps } from 'next';

import {
    SimpleGrid,
    Stack,
    Img,
    Heading,
    Text,
    useColorModeValue,
    Center,
    LinkBox,
    LinkOverlay,
    Button,
    useBreakpointValue,
    GridItem,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import Layout from '../components/layout';
import SEO from '../components/seo';
import BedpresBlock from '../components/bedpres-block';
import { Bedpres, Post, Event } from '../lib/types';
import { PostAPI, BedpresAPI, EventAPI } from '../lib/api';
import ContentBox from '../components/content-box';
import PostPreview from '../components/post-preview';
import EventsBlock from '../components/events-block';

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
            <SEO title="Home" />
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
                                        <LinkOverlay isExternal>
                                            <Img alt="Bekk" src={bekkLogo} filter={bekkLogoFilter} htmlWidth="300px" />
                                        </LinkOverlay>
                                    </NextLink>
                                </LinkBox>
                            </Center>
                        </ContentBox>
                        <EventsBlock events={events} error={eventsError} />
                    </Stack>
                </GridItem>
                <GridItem>
                    <BedpresBlock bedpreses={bedpreses} error={bedpresError} />
                </GridItem>
            </SimpleGrid>
            {!posts && postsError && <Text>{postsError}</Text>}
            {posts && !postsError && (
                <Center>
                    <Stack w={['100%', null, null, null, '70%']} spacing="5">
                        {posts.map((post) => {
                            return <PostPreview key={post.slug} post={post} className="post" />;
                        })}
                        {posts.length > 0 && (
                            <Center>
                                <LinkBox>
                                    <NextLink href="/posts" passHref>
                                        <LinkOverlay>
                                            <Button w="100%" colorScheme="teal">
                                                Alle poster
                                            </Button>
                                        </LinkOverlay>
                                    </NextLink>
                                </LinkBox>
                            </Center>
                        )}
                    </Stack>
                </Center>
            )}
        </Layout>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const bedpresesResponse = await BedpresAPI.getBedpreses(3);
    const postsResponse = await PostAPI.getPosts(2);
    const eventsResponse = await EventAPI.getEvents(5);

    return {
        props: {
            bedpreses: bedpresesResponse.bedpreses,
            bedpresError: bedpresesResponse.error,
            posts: postsResponse.posts,
            postsError: postsResponse.error,
            events: eventsResponse.events,
            eventsError: eventsResponse.error,
        },
    };
};

export default IndexPage;
