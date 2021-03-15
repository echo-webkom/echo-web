import React from 'react';
import Link from 'next/link';
import { Box, GridItem, SimpleGrid, Center, Text, Flex, Img } from '@chakra-ui/react';
import { Post } from '../lib/types';

const getGradient = (index: number) => {
    const gradients = [
        'linear-gradient(to-t, #051937, #004d7a, #008793, #00bf72, #a8eb12)',
        'linear-gradient(0deg, rgba(34,193,195,1) 0%, rgba(215,253,45,1) 100%)',
        'linear-gradient(0deg, rgba(34,52,195,1) 0%, rgba(45,253,238,1) 100%)',
        'linear-gradient(0deg, rgba(34,120,195,1) 0%, rgba(168,122,140,1) 41%, rgba(253,141,45,1) 100%)',
        'radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%)',
        'linear-gradient(0deg, #FC466B 0%, #3F5EFB 100%)',
        'linear-gradient(0deg, #fcff9e 0%, #c67700 100%)',
        'linear-gradient(0deg, #00d2ff 0%, #3a47d5 100%)',
        'radial-gradient(circle, #efd5ff 0%, #515ada 100%)',
        'linear-gradient(0deg, #3F2B96 0%, #A8C0FF 100%)',
    ];
    return gradients[index % gradients.length];
};

const PostCard = ({ post, index }: { post: Post; index: number }): JSX.Element => {
    return (
        <Link href={`/posts/${post.slug}`}>
            <Center>
                <Box
                    position="relative"
                    display="block"
                    width="100%"
                    pb="100%"
                    boxShadow="lg"
                    role="group"
                    bg="white"
                    cursor="pointer"
                >
                    <Box
                        position="absolute"
                        width="100%"
                        height="100%"
                        transition="ease-in-out, 0.3s"
                        _groupHover={{ opacity: '0.8' }}
                    >
                        {post.thumbnail && (
                            <Img src={post.thumbnail} alt="Picture of post" width="100%" height="100%" />
                        )}
                        {!post.thumbnail && <Box bgGradient={getGradient(index)} width="100%" height="100%" />}
                    </Box>
                    <Flex
                        position="absolute"
                        width="100%"
                        height="100%"
                        p="1rem"
                        textAlign="left"
                        alignItems="flex-end"
                    >
                        <Text as="mark" bg="black" color="white" fontSize="1.4rem" p="0.3rem" maxWidth="60%">
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
        <Center data-testid="post-block">
            {posts && !error && (
                <SimpleGrid w="90%" gap="20px" columns={{ sm: 4, md: 8, xl: 12 }} overflow="hidden" pb="2rem">
                    {posts.map((post, i) => (
                        <GridItem key={post.slug} colSpan={4} data-testid={post.slug}>
                            <PostCard post={post} index={i} />
                        </GridItem>
                    ))}
                </SimpleGrid>
            )}
            {!posts && error && <Text>{error}</Text>}
        </Center>
    );
};

export default PostBlock;
