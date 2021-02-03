import { Center, VStack, StackDivider, Text } from '@chakra-ui/react';
import React from 'react';

import { GetStaticProps } from 'next';
import PostAPI from '../../lib/api/post';
import { Author, Post } from '../../lib';
import PostPreview from '../../components/post-preview';
import Layout from '../../components/layout';

const PostCollectionPage = ({ posts }: { posts: Array<Post> }): JSX.Element => {
    return (
        <Layout>
            <Center>
                {posts.length === 0 && <Text>No posts found</Text>}
                {posts.length !== 0 && (
                    <VStack divider={<StackDivider borderColor="gray.200" />} spacing={8} align="stretch" width="50%">
                        {posts.map((post: Post) => {
                            return <PostPreview key={post.slug} post={post} />;
                        })}
                    </VStack>
                )}
            </Center>
        </Layout>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    try {
        const { data } = await PostAPI.getPosts(10);
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

export default PostCollectionPage;
