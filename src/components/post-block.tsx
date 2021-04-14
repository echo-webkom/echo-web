import React from 'react';
import NextLink from 'next/link';
import { Box, Text, HStack, StackDivider, Heading, Center, LinkBox, LinkOverlay, Button } from '@chakra-ui/react';

import { isBefore } from 'date-fns';
import { Post } from '../lib/types';
import ContentBox from './content-box';

const PostCard = ({ post, testid }: { post: Post; testid: string }) => {
    return (
        <Box bg="gray.50" w="24em" textAlign="center" p="1em" pb="2em" pos="relative" boxShadow="md">
            <Heading size="lg" mb="1em">
                {post.title}
            </Heading>
            <Text>{post.body}</Text>
            <Text pos="absolute" bottom="0" right="8" bg="turquoise" py="1" px="3">
                {post.author.authorName}
            </Text>
        </Box>
    );
};

const PostBlock = ({ posts, error }: { posts: Array<Post> | null; error: string | null }): JSX.Element => {
    return (
        <ContentBox testid="post-block">
            <Box my=".5em">
                {posts && !error && posts.length <= 0 && (
                    <Center>
                        <Text>Ingen Innlegg</Text>
                    </Center>
                )}
                {posts && !error && (
                    <HStack spacing={5} divider={<StackDivider />}>
                        {posts.map((post: Post) => {
                            return <PostCard key={post.slug} post={post} testid={post.slug} />;
                        })}
                    </HStack>
                )}
                {!posts && error && <Text>{error}</Text>}
            </Box>
        </ContentBox>
    );
};

export default PostBlock;
