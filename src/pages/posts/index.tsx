import React from 'react';

import { GetStaticProps } from 'next';
import { PostAPI, Post } from '../../lib/api/post';
import Layout from '../../components/layout';
import PostList from '../../components/post-list';
import SEO from '../../components/seo';

const PostCollectionPage = ({ posts, error }: { posts: Array<Post>; error: string }): JSX.Element => {
    return (
        <Layout>
            <SEO title="Innlegg" />
            <PostList posts={posts} postsPerPage={6} error={error} />
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
