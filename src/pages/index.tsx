import React from 'react';

import { GetStaticProps } from 'next';
import Layout from '../components/layout';
import SEO from '../components/seo';
import Events from '../components/events';
import PostBlock from '../components/postBlock';
import PostAPI from '../lib/api/post';
import { Author, Post } from '../lib';

const IndexPage = ({ posts }: { posts: Array<Post> }): JSX.Element => (
    <Layout>
        <SEO title="Home" />
        <PostBlock posts={posts} />
        <Events />
    </Layout>
);

export const getStaticProps: GetStaticProps = async () => {
    try {
        const { data } = await PostAPI.getPosts(3);
        return {
            props: {
                posts: data.data.postCollection.items.map(
                    (post: {
                        title: string;
                        slug: string;
                        body: string;
                        sys: { firstPublishedAt: string };
                        author: Author;
                    }) => {
                        return {
                            title: post.title,
                            slug: post.slug,
                            body: post.body,
                            publishedAt: post.sys.firstPublishedAt,
                            author: post.author,
                        };
                    },
                ),
            },
            revalidate: 1,
        };
    } catch (error) {
        return {
            props: {
                posts: [],
            },
            revalidate: 1,
        };
    }
};

export default IndexPage;
