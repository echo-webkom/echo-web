import { Box, Center, Divider, Grid, GridItem, Heading, Icon, Spinner, Text } from '@chakra-ui/react';
import { format, parseISO } from 'date-fns';
import { nb } from 'date-fns/locale';
import Markdown from 'markdown-to-jsx';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import React from 'react';
import { BiCalendar } from 'react-icons/bi';
import { CgProfile } from 'react-icons/cg';
import ErrorBox from '../../components/error-box';
import Layout from '../../components/layout';
import Section from '../../components/section';
import SEO from '../../components/seo';
import { Post, PostAPI } from '../../lib/api/post';
import MapMarkdownChakra from '../../markdown';

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
                            <GridItem colSpan={1} colStart={1} rowStart={[2, null, null, 1]} as={Section}>
                                <Grid templateColumns="min-content auto" gap="3" alignItems="center">
                                    <Icon as={CgProfile} boxSize={10} />
                                    <Text>{post.author}</Text>
                                    <Icon as={BiCalendar} boxSize={10} />
                                    <Text>{format(parseISO(post._createdAt), 'dd. MMM yyyy', { locale: nb })}</Text>
                                </Grid>
                            </GridItem>
                            <GridItem
                                colStart={[1, null, null, 2]}
                                rowStart={[1, null, null, null]}
                                colSpan={[1, null, null, 3]}
                                rowSpan={[1, null, null, 2]}
                                minW="0"
                            >
                                <Section>
                                    <Heading mb="0.2em" size="2xl">
                                        {post.title}
                                    </Heading>
                                    <Divider mb="1em" />
                                    <Markdown options={{ overrides: MapMarkdownChakra }}>{post.body}</Markdown>
                                </Section>
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
