import { Button, Center, Divider, StackDivider, Text, VStack } from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import { Post } from '../lib/types';
import PostPreview from './post-preview';

const PostList = ({ posts, error }: { posts: Array<Post>; error: string }): JSX.Element => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        window.scrollTo(0, window.scrollX);
    });

    return (
        <>
            <Center>
                {posts.length === 0 && !error && <Text>No posts found</Text>}
                {posts.length === 0 && error && <Text>{error}</Text>}
                {posts.length !== 0 && (
                    <VStack className="post-list" divider={<StackDivider />} spacing={8} align="stretch" width="50%">
                        {posts.slice(index, index + 4).map((post: Post) => {
                            return <PostPreview className="post" key={post.slug} post={post} />;
                        })}
                    </VStack>
                )}
            </Center>
            <Divider mb="5" mt="5" />
            <Center>
                <Button display={index !== 0 ? '' : 'none'} onClick={() => setIndex((prevIndex) => prevIndex - 4)}>
                    Forrige
                </Button>
                <Button
                    display={index + 4 < posts.length ? '' : 'none'}
                    onClick={() => setIndex((prevIndex) => prevIndex + 4)}
                >
                    Neste
                </Button>
            </Center>
        </>
    );
};

export default PostList;
