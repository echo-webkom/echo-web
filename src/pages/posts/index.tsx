import React from 'react';

import { GetStaticProps } from 'next';
import { Text } from '@chakra-ui/react';
import { PostAPI } from '../../lib/api';
import { Post } from '../../lib/types';
import Layout from '../../components/layout';
import PostList from '../../components/post-list';
import ContentBox from '../../components/content-box';

const PostCollectionPage = ({ posts, error }: { posts: Array<Post>; error: string }): JSX.Element => {
    return (
        <Layout>
            {posts && !error && <PostList posts={posts} />}
            {!posts && error && (
                <ContentBox>
                    <Text>{error}</Text>
                </ContentBox>
            )}
        </Layout>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const { posts, error } = await PostAPI.getPosts(0); // 0 for all posts

    if (posts) {
        return {
            props: {
                posts,
                error,
            },
        };
    }
    return {
        props: {
            posts: [],
            error,
        },
    };
};

export default PostCollectionPage;
