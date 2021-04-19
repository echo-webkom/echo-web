import React from 'react';
import NextLink from 'next/link';
import {
    Box,
    Flex,
    Text,
    HStack,
    StackDivider,
    Heading,
    Center,
    useColorModeValue,
    LinkBox,
    LinkOverlay,
    Button,
} from '@chakra-ui/react';
import Markdown from 'markdown-to-jsx';
import { Post } from '../lib/types';
import ContentBox from './content-box';
import MapMarkdownChakra from '../markdown';

const PostCard = ({ post, testid }: { post: Post; testid: string }) => {
    const bg = useColorModeValue('gray.50', 'gray.800');
    const authorBg = useColorModeValue('yellow.500', 'yellow.300');
    const authorColor = useColorModeValue('white', 'black');
    return (
        <LinkBox>
            <NextLink href={`/posts/${post.slug}`} passHref>
                <LinkOverlay>
                    <Box
                        w={['18em', null, '25em']}
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
                                            component: Text,
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

const PostBlock = ({ posts, error }: { posts: Array<Post> | null; error: string | null }): JSX.Element => {
    const buttonTheme = useColorModeValue('black', 'white');
    return (
        <ContentBox my=".5em" data-testid="post-block" overflowX="auto">
            {posts && !error && posts.length <= 0 && (
                <Center>
                    <Text>Ingen Innlegg</Text>
                </Center>
            )}
            {posts && !error && (
                <Flex position="relative" display="inline-block" pr="28" wrap="nowrap">
                    <HStack spacing={5} divider={<StackDivider />} shouldWrapChildren>
                        {posts.map((post: Post) => {
                            return <PostCard key={post.slug} post={post} testid={post.slug} />;
                        })}
                    </HStack>
                    <LinkBox position="absolute" bottom="0" right="4" textAlign="end">
                        <NextLink href="/posts" passHref>
                            <LinkOverlay>
                                <Button w="100%" colorScheme={buttonTheme} variant="link">
                                    Se Alle [...]
                                </Button>
                            </LinkOverlay>
                        </NextLink>
                    </LinkBox>
                </Flex>
            )}
            {!posts && error && <Text>{error}</Text>}
        </ContentBox>
    );
};

export default PostBlock;
