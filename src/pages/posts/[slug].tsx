import React from 'react';
import { NextPageContext } from 'next';
import { Box, Text, Flex, Center } from '@chakra-ui/react';
import { CgProfile } from 'react-icons/cg';
import { BiCalendar } from 'react-icons/bi';
import Markdown from 'markdown-to-jsx';
import moment from 'moment';

import Layout from '../../components/layout';
import SEO from '../../components/seo';
import MapMarkdownChakra from '../../markdown';
import { Post } from '../../lib';

interface Props {
    post?: Post;
}

const PostPage = ({ post }: Props): JSX.Element => {
    return (
        <Layout>
            {!post && <Text>Loading...</Text>}
            {post && (
                <>
                    <SEO title={post.title} />
                    <Box maxW="4xl">
                        <Box borderWidth="1px" borderRadius="0.75em" overflow="hidden" pl="6" pr="6" mb="1em">
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
                            <Text display="flex">
                                <Center>
                                    <Box mr="2">
                                        <CgProfile />
                                    </Box>
                                </Center>
                                av {post.author.authorName}
                            </Text>
                            <Text display="flex">
                                <Center mr="2">
                                    <BiCalendar />
                                </Center>
                                {moment(post.publishedAt).format('DD. MMM YYYY')}
                            </Text>
                        </Flex>
                    </Box>
                </>
            )}
        </Layout>
    );
};

const GET_POST_BY_SLUG = `
    query ($slug: String!) {
        postCollection(where: { slug: $slug }) {
            total
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

PostPage.getInitialProps = async ({ query }: NextPageContext) => {
    const res = await fetch(
        `https://graphql.contentful.com/content/v1/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
                query: GET_POST_BY_SLUG,
                variables: {
                    slug: query.slug,
                },
            }),
        },
    );

    const rawPost = await res.json();
    const post = {
        title: rawPost.data.postCollection.items[0].title,
        slug: rawPost.data.postCollection.items[0].slug,
        body: rawPost.data.postCollection.items[0].body,
        publishedAt: rawPost.data.postCollection.items[0].sys.firstPublishedAt,
        author: rawPost.data.postCollection.items[0].author,
    };
    return { post };
};

PostPage.defaultProps = {
    post: {
        title: 'Post Title',
        slug: 'post',
        body: '',
        publishedAt: '',
        author: {
            authorName: '',
        },
    },
};

export default PostPage;
