import React from 'react';

import { GetServerSideProps } from 'next';
import Layout from '../components/layout';
import SEO from '../components/seo';
import Events from '../components/events';
import PostBlock from '../components/post-block';
import PostAPI from '../lib/api/post';
import { Post } from '../lib/types';

const IndexPage = ({ posts }: { posts: Array<Post> }): JSX.Element => (
    <Layout>
        <SEO title="Home" />
        <PostBlock posts={posts} />
        <Events />
    </Layout>
);

export const getServerSideProps: GetServerSideProps = async () => {
    try {
        const { posts } = await PostAPI.getPosts(4);
        return {
            props: {
                posts,
            },
        };
    } catch (error) {
        return {
            props: {
                posts: [],
            },
        };
    }
};

export default IndexPage;
