import type { ParsedUrlQuery } from 'querystring';
import { Box, Center, Divider, Heading, HStack, Spinner } from '@chakra-ui/react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
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
import { useEffect, useState } from 'react';

interface Props {
    post: Post;
}

const PostPage = ({ post }: Props): JSX.Element => {
    const router = useRouter();
    const [isNorwegian, setIsNorwegian] = useState(true);
    useEffect(() => {
        function checkLanguageData() {
            const lang = localStorage.getItem('language');
            if (lang === 'en') {
                setIsNorwegian(false);
            } else {
                setIsNorwegian(true);
            }
        }
        checkLanguageData();
        window.addEventListener('storage', checkLanguageData);
        return () => {
            window.removeEventListener('storage', checkLanguageData);
        };
    }, []);
    const localeTitle = (): string => {
        /* eslint-disable */
        const output = isNorwegian
            ? post.title.no
            : post.title.en
            ? post.title.en
            : '(No english version avalible) \n\n' + post.title.no;
        return output;
        /* eslint-enable */
    };

    return (
        <>
            {router.isFallback && (
                <Center>
                    <Spinner />
                </Center>
            )}
            {!router.isFallback && (
                <>
                    <SEO title={post.title.no} />
                    <Box>
                        <Section>
                            <Heading mb="0.2em" size="2xl">
                                {localeTitle()}
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

                            <Markdown options={{ overrides: MapMarkdownChakra }}>
                                {
                                    /* eslint-disable */
                                    isNorwegian
                                        ? post.body.no
                                        : post.body.en
                                        ? post.body.en
                                        : '(No english version avalible) \n\n' + post.body.no

                                    /* eslint-enable */
                                }
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
