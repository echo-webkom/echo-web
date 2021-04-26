import React from 'react';
import NextLink from 'next/link';
import { Box, Text, Heading, Center, useColorModeValue, LinkBox, LinkOverlay } from '@chakra-ui/react';
import Markdown from 'markdown-to-jsx';
import { Post } from '../lib/types';
import ContentBox from './content-box';
import MapMarkdownChakra from '../markdown';

const Span = ({ children }: { children: React.ReactNode }): JSX.Element => {
    return <span>{children}</span>;
};

const PostCard = ({ post, testid }: { post: Post; testid: string }) => {
    const bg = useColorModeValue('gray.50', 'gray.800');
    const authorBg = useColorModeValue('yellow.500', 'yellow.300');
    const authorColor = useColorModeValue('white', 'black');
    return (
        <LinkBox>
            <NextLink href={`/posts/${post.slug}`} passHref>
                <LinkOverlay>
                    <Box
                        w="100%"
                        bg={bg}
                        minH="16rem"
                        textAlign="center"
                        p="1em"
                        px="2em"
                        pb="3em"
                        pos="relative"
                        boxShadow="md"
                        data-testid={testid}
                    >
                        <Heading size="lg" mb="1em">
                            {post.title}
                        </Heading>
                        {/* <Text textOverflow="ellipsis" overflow="hidden" noOfLines={4}>{post.body}</Text> */}
                        <Box h="8em" overflow="hidden">
                            <Markdown
                                options={{
                                    overrides: {
                                        ...MapMarkdownChakra,
                                        a: {
                                            component: Span,
                                            props: {
                                                isExternal: true,
                                                color: 'blue',
                                            },
                                        },
                                    },
                                }}
                            >
                                {post.body}
                            </Markdown>
                        </Box>
                        <Center pt="5">
                            <Text size="md">[...]</Text>
                        </Center>
                        <Text pos="absolute" bottom="0" right="8" color={authorColor} bg={authorBg} py="1" px="3">
                            {post.author.authorName}
                        </Text>
                    </Box>
                </LinkOverlay>
            </NextLink>
        </LinkBox>
    );
};

export default PostCard;
