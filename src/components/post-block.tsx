import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Box, GridItem, SimpleGrid, Center, Text, Flex } from '@chakra-ui/react';
import { Post } from '../lib/types';

const PostCard = ({ post }: { post: Post }): JSX.Element => {
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
                        <Image src="/placeholder_image.png" alt="Picture of post" layout="fill" />
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

const PostBlock = ({ posts }: { posts: Array<Post> }): JSX.Element => {
    return (
        <Center>
            <SimpleGrid w="90%" gap="20px" columns={{ sm: 4, md: 8, xl: 12 }} overflow="hidden" pb="2rem">
                {posts.map((post) => (
                    <GridItem key={post.slug} colSpan={4}>
                        <PostCard post={post} />
                    </GridItem>
                ))}
            </SimpleGrid>
        </Center>
    );
};

export default PostBlock;
