import React from 'react';
import { useRouter } from 'next/router';
import { Box, Text, Flex, Center, Heading } from '@chakra-ui/react';
import { CgProfile } from 'react-icons/cg';
import { BiCalendar } from 'react-icons/bi';
import Markdown from 'markdown-to-jsx';
import moment from 'moment';

import Layout from '../../components/layout';
import SEO from '../../components/seo';
import MapMarkdownChakra from '../../markdown';
import { Post } from '../../lib';

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

const GET_POSTS = `
    query {
        postCollection(limit: 10) {
            items {
                slug
            }
        }
    }
`;

const GET_POST_BY_SLUG = `
    query ($slug: String!) {
        postCollection(where: { slug: $slug }) {
            items {
                title
                slug
                body
                author {
                    authorName
                }
                sys {
                    firstPublishedAt
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
            query: GET_POSTS,
        }),
    });

    const json = await res.json();
    const paths = json.data.postCollection.items.map((post: { slug: any }) => ({
        params: {
            slug: post.slug,
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
            query: GET_POST_BY_SLUG,
            variables: {
                slug: params.slug,
            },
        }),
    });

    if (res.ok) {
        const rawPost = await res.json();

        if (rawPost.data.postCollection.items.length <= 0) {
            return {
                props: {
                    post: null,
                },
            };
        }

        const formattedPost = {
            title: rawPost.data.postCollection.items[0].title,
            slug: rawPost.data.postCollection.items[0].slug,
            body: rawPost.data.postCollection.items[0].body,
            publishedAt: rawPost.data.postCollection.items[0].sys.firstPublishedAt,
            author: rawPost.data.postCollection.items[0].author,
        };

        return { props: { post: formattedPost }, revalidate: 1 };
    }

    return {
        props: {
            error: 'An error has occured, please try again later.',
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
