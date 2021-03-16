import React from 'react';
import Link from 'next/link';
import { Box, Center, Text, Flex, Img, Wrap } from '@chakra-ui/react';
import { Post } from '../lib/types';

const PostCard = ({ post }: { post: Post }): JSX.Element => {
    return (
        <Link href={`/posts/${post.slug}`}>
            <Center>
                <Box
                    position="relative"
                    display="block"
                    w="350px"
                    pb="100%"
                    boxShadow="lg"
                    role="group"
                    bg="white"
                    cursor="pointer"
                >
                    <Box
                        position="absolute"
                        w="100%"
                        h="100%"
                        transition="ease-in-out, 0.3s"
                        _groupHover={{ opacity: '0.8' }}
                    >
                        {post.thumbnail && <Img src={post.thumbnail} alt="Picture of post" w="100%" h="100%" />}
                        {!post.thumbnail && <Box w="100%" h="100%" />}
                    </Box>
                    <Flex position="absolute" w="100%" h="100%" p="1rem" textAlign="left" alignItems="flex-end">
                        <Text as="mark" bg="black" color="white" fontSize="1.4rem" p="0.3rem" maxW="60%">
                            {post.title}
                        </Text>
                    </Flex>
                </Box>
            </Center>
        </Link>
    );
};

const PostBlock = ({ posts, error }: { posts: Array<Post> | null; error: string | null }): JSX.Element => {
    return (
        <Box data-testid="post-block">
            {posts && !error && (
                <Wrap w="100%" spacing="20px" justify="center" overflow="hidden">
                    {posts.map((post) => (
                        <PostCard post={post} key={post.slug} />
                    ))}
                </Wrap>
            )}
            {!posts && error && <Text>{error}</Text>}
        </Box>
    );
};

export default PostBlock;
