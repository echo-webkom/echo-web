import React from 'react';

import { GetStaticProps } from 'next';
import { PostAPI } from '../../lib/api';
import { Post } from '../../lib/types';
import Layout from '../../components/layout';
import PostList from '../../components/post-list';

const PostCollectionPage = ({ posts }: { posts: Array<Post> }): JSX.Element => {
    return (
        <Layout>
            <PostList posts={posts} />
        </Layout>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const { posts } = await PostAPI.getPosts(0); // 0 for all posts

    if (posts) {
        return {
            props: {
                posts,
            },
        };
    }
    return {
        props: {
            posts: [],
        },
    };
};

export default PostCollectionPage;
