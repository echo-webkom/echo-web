import { GetStaticProps } from 'next';
import React from 'react';
import PostList from '../../components/post-list';
import SEO from '../../components/seo';
import { Post, PostAPI } from '../../lib/api';

interface Props {
    posts: Array<Post>;
    error: string | null;
}

const PostCollectionPage = ({ posts, error }: Props): JSX.Element => {
    return (
        <>
            <SEO title="Innlegg" />
            <PostList posts={posts} postsPerPage={6} error={error} />
        </>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const { posts, error } = await PostAPI.getPosts(0); // 0 for all posts

    if (posts) {
        const props: Props = {
            posts,
            error,
        };

        return { props };
    }

    return {
        props: {
            posts: [],
            error,
        },
    };
};

export default PostCollectionPage;
