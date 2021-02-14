import React from 'react';

import { GetServerSideProps } from 'next';
import PostAPI from '../../lib/api/post';
import { Author, Post } from '../../lib';
import Layout from '../../components/layout';
import PostList from '../../components/post-list';

const PostCollectionPage = ({ posts, totalPosts }: { posts: Array<Post>; totalPosts: number }): JSX.Element => {
    return (
        <Layout>
            <PostList postCollection={posts} totalPosts={totalPosts} />
        </Layout>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
    const page = parseInt(query.page as string, 10) || 1;

    try {
        const posts = await PostAPI.getPosts(page * 4);
        const totalPosts = (await PostAPI.getTotalPosts()).data.data.postCollection.items.length;
        return {
            props: {
                posts: posts.data.data.postCollection.items
                    .slice(page * 4 - 4, page * 4)
                    .map(
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
                totalPosts,
            },
        };
    } catch (error) {
        return {
            props: {
                posts: [],
                totalPosts: 0,
            },
        };
    }
};

export default PostCollectionPage;
