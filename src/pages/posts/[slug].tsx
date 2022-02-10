import { ParsedUrlQuery } from 'querystring';
import { Box, Center, Divider, Heading, HStack, Spinner } from '@chakra-ui/react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import Markdown from 'markdown-to-jsx';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import { BiCalendar } from 'react-icons/bi';
import ErrorBox from '../../components/error-box';
import IconText from '../../components/icon-text';
import Section from '../../components/section';
import SEO from '../../components/seo';
import { Post, PostAPI } from '../../lib/api';
import MapMarkdownChakra from '../../markdown';

interface Props {
    post: Post;
    error: string | null;
}

const PostPage = ({ post, error }: Props): JSX.Element => {
    const router = useRouter();

    return (
        <>
            {router.isFallback && (
                <Center>
                    <Spinner />
                </Center>
            )}
            {error && !router.isFallback && <ErrorBox error={error} />}
            {!router.isFallback && !error && (
                <>
                    <SEO title={post.title} />
                    <Box>
                        <Section>
                            <Heading mb="0.2em" size="2xl">
                                {post.title}
                            </Heading>

                            <Divider mb="0.5em" />

                            <HStack justify="space-between">
                                <Heading size="m">@{post.author}</Heading>

                                <IconText
                                    icon={BiCalendar}
                                    text={format(new Date(post._createdAt), 'dd. MMM yyyy', { locale: nb })}
                                />
                            </HStack>

                            <Divider my="0.5em" />

                            <Markdown options={{ overrides: MapMarkdownChakra }}>{post.body}</Markdown>
                        </Section>
                    </Box>
                </>
            )}
        </>
    );
};

const getStaticPaths: GetStaticPaths = async () => {
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

const getStaticProps: GetStaticProps = async (context) => {
    const { slug } = context.params as Params;
    const { post, error } = await PostAPI.getPostBySlug(slug);

    if (!post || error === '404') {
        return {
            notFound: true,
        };
    }

    const props: Props = {
        post,
        error,
    };

    return {
        props,
    };
};

export default PostPage;
export { getStaticProps, getStaticPaths };
