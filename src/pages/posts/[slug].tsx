import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { useRouter } from 'next/router';
import { Box, Text, Grid, GridItem, Heading, Divider, Icon, Center, Spinner } from '@chakra-ui/react';
import { CgProfile } from 'react-icons/cg';
import { BiCalendar } from 'react-icons/bi';
import Markdown from 'markdown-to-jsx';
import { format, parseISO } from 'date-fns';

import Layout from '../../components/layout';
import SEO from '../../components/seo';
import MapMarkdownChakra from '../../markdown';
import { PostAPI, Post } from '../../lib/api/post';

import ContentBox from '../../components/content-box';
import ErrorBox from '../../components/error-box';

const PostPage = ({ post, error }: { post: Post; error: string }): JSX.Element => {
    const router = useRouter();

    return (
        <Layout>
            {router.isFallback && (
                <Center>
                    <Spinner />
                </Center>
            )}
            {error && !router.isFallback && !post && <ErrorBox error={error} />}
            {post && !router.isFallback && !error && (
                <>
                    <SEO title={post.title} />
                    <Box>
                        <Grid templateColumns={['repeat(1, 1fr)', null, null, 'repeat(4, 1fr)']} gap="4">
                            <GridItem colSpan={1} rowStart={[2, null, null, null]} as={ContentBox}>
                                <Grid templateColumns="min-content auto" gap="3" alignItems="center">
                                    <Icon as={CgProfile} boxSize={10} />
                                    <Text>{post.author}</Text>
                                    <Icon as={BiCalendar} boxSize={10} />
                                    <Text>{format(parseISO(post.publishedAt), 'dd. MMM yyyy')}</Text>
                                </Grid>
                            </GridItem>
                            <GridItem
                                colStart={[1, null, null, 2]}
                                rowStart={[1, null, null, null]}
                                colSpan={[1, null, null, 3]}
                                rowSpan={2}
                                minW="0"
                            >
                                <ContentBox>
                                    <Heading mb="0.2em">{post.title}</Heading>
                                    <Divider mb="1em" />
                                    <Markdown options={MapMarkdownChakra}>{post.body}</Markdown>
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

    if (error === '404') {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            post,
            error,
        },
    };
};

export default PostPage;
