import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { useRouter } from 'next/router';
import { Box, Text, Flex, Center, Heading } from '@chakra-ui/react';
import { CgProfile } from 'react-icons/cg';
import { BiCalendar } from 'react-icons/bi';
import Markdown from 'markdown-to-jsx';
import moment from 'moment';

import Layout from '../../components/layout';
import SEO from '../../components/seo';
import MapMarkdownChakra from '../../markdown';
import { Post } from '../../lib/types';

import { PostAPI } from '../../lib/api';

const PostPage = ({ post, error }: { post?: Post; error?: string }): JSX.Element => {
    const router = useRouter();

    return (
        <Layout>
            {router.isFallback && <Text>Loading...</Text>}
            {!router.isFallback && !post && <Text>Post not found</Text>}
            {error && !router.isFallback && <Text>{error}</Text>}
            {post && !router.isFallback && !error && (
                <>
                    <SEO title={post.title} />
                    <Box>
                        <Box borderWidth="1px" borderRadius="0.75em" overflow="hidden" pl="6" pr="6" mb="1em">
                            <Heading mb="0.5em" mt="0.5em">
                                {post.title}
                            </Heading>
                            <Markdown options={MapMarkdownChakra}>{post.body}</Markdown>
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
                                <Text>av {post.author.authorName}</Text>
                            </Flex>
                            <Flex>
                                <Center mr="2">
                                    <BiCalendar />
                                </Center>
                                <Text>{moment(post.publishedAt).format('DD. MMM YYYY')}</Text>
                            </Flex>
                        </Flex>
                    </Box>
                </>
            )}
        </Layout>
    );
};

export const getStaticPaths: GetStaticPaths = async () => {
    const paths = await PostAPI.getPaths();
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
    const { post, error } = await PostAPI.getPostBySlug(slug);

    return {
        props: {
            post,
            error,
        },
    };
};

PostPage.defaultProps = {
    post: {
        title: 'title',
        slug: 'slug',
        body: '',
        publishedAt: '2020-01-01T00:00:00.000Z',
        author: {
            authorName: 'Author McAuthor',
        },
    },
    error: '',
};

export default PostPage;
