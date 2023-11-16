import type { ParsedUrlQuery } from 'querystring';
import { Box, Center, Divider, Flex, Heading, HStack, Spacer, Spinner } from '@chakra-ui/react';
import { format } from 'date-fns';
import { nb, enUS } from 'date-fns/locale';
import Markdown from 'markdown-to-jsx';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { BiCalendar } from 'react-icons/bi';
import IconText from '@components/icon-text';
import Section from '@components/section';
import SEO from '@components/seo';
import type { Post } from '@api/post';
import { PostAPI } from '@api/post';
import { isErrorMessage } from '@utils/error';
import MapMarkdownChakra from '@utils/markdown';
import useLanguage from '@hooks/use-language';

interface Props {
    post: Post;
}

const PostPage = ({ post }: Props): JSX.Element => {
    const router = useRouter();
    const isNorwegian = useLanguage();
    // eslint-disable-next-line unicorn/prefer-logical-operator-over-ternary
    const localeTitle = () => (isNorwegian ? post.title.no : post.title.en ? post.title.en : post.title.no);

    return (
        <>
            {router.isFallback && (
                <Center>
                    <Spinner />
                </Center>
            )}
            {!router.isFallback && (
                <>
                    <SEO title={post.title.no} description={`${post.body.no.slice(0, 60)} ...`} />
                    <Box>
                        <Section>
                            <Flex direction="row" alignItems="center">
                                <Heading mb="0.2em" size="2xl">
                                    {localeTitle()}
                                </Heading>
                                <Spacer />
                            </Flex>

                            <Divider mb="0.5em" />

                            <HStack justify="space-between">
                                <Heading size="m">@{post.author}</Heading>
                                <IconText
                                    icon={BiCalendar}
                                    text={format(new Date(post._createdAt), 'dd. MMM yyyy', {
                                        locale: isNorwegian ? nb : enUS,
                                    })}
                                />
                            </HStack>

                            <Divider my="0.5em" />

                            <Markdown options={{ overrides: MapMarkdownChakra }}>
                                {isNorwegian
                                    ? post.body.no
                                    : // eslint-disable-next-line unicorn/prefer-logical-operator-over-ternary
                                      post.body.en
                                      ? post.body.en
                                      : '(No english version avalible) \n\n' + post.body.no}
                            </Markdown>
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
