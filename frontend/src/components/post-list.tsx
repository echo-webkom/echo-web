import { Center, Wrap } from '@chakra-ui/react';
import React from 'react';
import { Post } from '../lib/api';
import PostPreview from './post-preview';

interface Props {
    posts: Array<Post>;
}

const PostList = ({ posts }: Props): JSX.Element => {
    return (
        <Center>
            <Wrap pt="1rem" className="post-list" spacing={8} w="100%" justify="center">
                {posts.map((post: Post) => {
                    return <PostPreview key={post.slug} post={post} data-testid={post.slug} w="22em" />;
                })}
            </Wrap>
        </Center>
    );
};

export default PostList;
