import React from 'react';
import { Flex, Center } from '@chakra-ui/react';
import PostAPI from '../lib/api/post';
import { Post } from '../lib';

const PostCard = ({ post }: { post: Post }): JSX.Element => {
    return (
        <Flex direction="column" bg="yellow.300" w={200} h={200}>
            <h1>{post.title}</h1>
        </Flex>
    );
};

const PostBlock = ({ posts }: { posts: Array<Post> }): JSX.Element => {
    return (
        <Center>
            <Flex p={6} m={6}>
                {posts.map((post: Post) => (
                    <PostCard key={post.slug} post={post} />
                ))}
            </Flex>
        </Center>
    );
};

export default PostBlock;
