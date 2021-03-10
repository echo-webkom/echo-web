import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { useRouter } from 'next/router';
import { Box, Text, Grid, GridItem, Heading, Divider, Img } from '@chakra-ui/react';
import { CgProfile } from 'react-icons/cg';
import { BiCalendar } from 'react-icons/bi';
import Markdown from 'markdown-to-jsx';
import moment from 'moment';

import Layout from '../../components/layout';
import SEO from '../../components/seo';
import MapMarkdownChakra from '../../markdown';
import { Post } from '../../lib/types';

import { PostAPI } from '../../lib/api';
import ContentBox from '../../components/content-box';

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
                        <Grid templateColumns={['repeat(1, 1fr)', null, null, 'repeat(4, 1fr)']} gap="4">
                            <GridItem colSpan={1} rowStart={[2, null, null, null]} as={ContentBox}>
                                <Grid templateColumns="min-content auto" gap="3" alignItems="center">
                                    <CgProfile size="2em" />
                                    <Text>{post.author.authorName}</Text>
                                    <BiCalendar size="2em" />
                                    <Text>{moment(post.publishedAt).format('DD. MMM YYYY')}</Text>
                                </Grid>
                            </GridItem>
                            <GridItem
                                colStart={[1, null, null, 2]}
                                rowStart={[1, null, null, null]}
                                colSpan={[1, null, null, 3]}
                                rowSpan={2}
                            >
                                <ContentBox>
                                    <Heading mb="0.2em">{post.title}</Heading>
                                    <Divider mb="1em" />
                                    <Markdown options={MapMarkdownChakra}>{post.body}</Markdown>
                                    <Img
                                        src={post.thumbnail ? post.thumbnail : '/placeholder_image.png'}
                                        alt="post thumbnail"
                                        width="300px"
                                        height="250px"
                                    />
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
