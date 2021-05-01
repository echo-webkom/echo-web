import { Button, Center, Divider, Text, SimpleGrid } from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import { Post } from '../lib/api/post';
import ErrorBox from './error-box';
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
                {posts.length === 0 && error && <ErrorBox error={error} />}
                {posts.length !== 0 && (
                    <SimpleGrid
                        pt="1rem"
                        columns={[1, null, null, 2]}
                        className="post-list"
                        spacing={10}
                        align="stretch"
                        w={['100%', null, null, null, '70%']}
                    >
                        {posts.slice(index, index + 6).map((post: Post) => {
                            return <PostPreview key={post.slug} post={post} data-testid={post.slug} />;
                        })}
                    </SimpleGrid>
                )}
            </Center>
            <Divider my="5" />
            <Center>
                <Button
                    mx=".5em"
                    colorScheme="teal"
                    display={index !== 0 ? '' : 'none'}
                    onClick={() => setIndex((prevIndex) => prevIndex - 4)}
                >
                    Forrige
                </Button>
                <Button
                    mx=".5em"
                    colorScheme="teal"
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
