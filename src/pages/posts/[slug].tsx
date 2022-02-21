import { ParsedUrlQuery } from 'querystring';
import { Box, Center, Divider, Heading, HStack, Spinner } from '@chakra-ui/react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import Markdown from 'markdown-to-jsx';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import { BiCalendar } from 'react-icons/bi';
import IconText from '../../components/icon-text';
import Section from '../../components/section';
import SEO from '../../components/seo';
import { isErrorMessage, Post, PostAPI } from '../../lib/api';
import MapMarkdownChakra from '../../markdown';

interface Props {
    post: Post;
}

const PostPage = ({ post }: Props): JSX.Element => {
    const router = useRouter();

    return (
        <>
            {router.isFallback && (
                <Center>
                    <Spinner />
                </Center>
            )}
            {!router.isFallback && (
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
    const post = await PostAPI.getPostBySlug(slug);

    if (isErrorMessage(post)) {
        if (post.message === '404') {
            return {
                notFound: true,
            };
        }
        throw new Error(post.message);
    }

    const props: Props = {
        post,
    };

    return {
        props,
    };
};

export default PostPage;
export { getStaticProps, getStaticPaths };
