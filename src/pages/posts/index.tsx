import { GetStaticProps } from 'next';
import React from 'react';
import Layout from '../../components/layout';
import PostList from '../../components/post-list';
import SEO from '../../components/seo';
import { Post, PostAPI } from '../../lib/api';

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
