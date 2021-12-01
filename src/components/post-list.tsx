import { Button, Center, Divider, Text, Wrap } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { Post } from '../lib/api';
import ErrorBox from './error-box';
import PostPreview from './post-preview';

interface Props {
    posts: Array<Post>;
    postsPerPage: number;
    error: string | null;
}

const PostList = ({ posts, postsPerPage, error }: Props): JSX.Element => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        window.scrollTo(0, window.scrollX);
    });

    return (
        <>
            <Center>
                {posts.length === 0 && !error && <Text>No posts found</Text>}
                {posts.length === 0 && error && <ErrorBox error={error} />}
                {posts.length > 0 && (
                    <Wrap pt="1rem" className="post-list" spacing={4} w="100%" justify="center">
                        {posts.slice(index, index + postsPerPage).map((post: Post) => {
                            return <PostPreview key={post.slug} post={post} data-testid={post.slug} />;
                        })}
                    </Wrap>
                )}
            </Center>
            <Divider my="5" />
            <Center>
                <Button
                    mx=".5em"
                    colorScheme="teal"
                    display={index !== 0 ? '' : 'none'}
                    onClick={() => setIndex((prevIndex) => prevIndex - postsPerPage)}
                >
                    Forrige
                </Button>
                <Button
                    mx=".5em"
                    colorScheme="teal"
                    display={index + postsPerPage < posts.length ? '' : 'none'}
                    onClick={() => setIndex((prevIndex) => prevIndex + postsPerPage)}
                >
                    Neste
                </Button>
            </Center>
        </>
    );
};

export default PostList;
