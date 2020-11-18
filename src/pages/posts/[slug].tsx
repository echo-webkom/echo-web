import React, { useEffect, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { Box, Text, Flex, Center } from '@chakra-ui/react';
import { CgProfile } from 'react-icons/cg';
import { BiCalendar } from 'react-icons/bi';
import Markdown from 'markdown-to-jsx';
import moment from 'moment';

import Layout from '../../components/layout';
import SEO from '../../components/seo';
import MapMarkdownChakra from '../../markdown';

const GET_POST_BY_SLUG = gql`
    query GetPostBySlug($slug: String!) {
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

const PostPage = (): JSX.Element => {
    const router = useRouter();
    const { slug } = router.query;

    const [shouldSkip, setShouldSkip] = useState(true);
    const { loading, error, data } = useQuery(GET_POST_BY_SLUG, {
        variables: { slug: router.query.slug },
        skip: shouldSkip,
    });

    useEffect(() => {
        if (slug) {
            setShouldSkip(false);
        }
    }, [slug]);

    return (
        <Layout>
            <SEO title={slug as string} />
            <Box maxW="4xl">
                {loading && <Text>Loading...</Text>}
                {error && <Text>Error {error.message}</Text>}
                {!loading && !error && data && (
                    <>
                        <Box borderWidth="1px" borderRadius="0.75em" overflow="hidden" pl="6" pr="6" mb="1em">
                            <Markdown options={MapMarkdownChakra}>{data.postCollection.items[0].body}</Markdown>
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
                                av {data.postCollection.items[0].author.authorName}
                            </Text>
                            <Text display="flex">
                                <Center mr="2">
                                    <BiCalendar />
                                </Center>
                                {moment(data.postCollection.items[0].sys.publishedAt).format('DD. MMM YYYY')}
                            </Text>
                        </Flex>
                    </>
                )}
            </Box>
        </Layout>
    );
};

export default PostPage;
