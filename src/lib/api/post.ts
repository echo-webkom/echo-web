import { Author, Post } from '..';
import API from './api';
import { GET_POST_PATHS, GET_N_POSTS, GET_POST_BY_SLUG } from './schema';

const PostAPI = {
    /**
     * Get the slugs of the 10 lasts posts.
     * This data is used to statically generate the pages of the 10 last published posts.
     */
    getPaths: async (): Promise<Array<string>> => {
        try {
            const { data } = await API.post('', {
                query: GET_POST_PATHS,
            });

            return data.data.postCollection.items.map((post: { slug: string }) => post.slug);
        } catch (error) {
            return [];
        }
    },

    /**
     * Get the n last published posts.
     * @param n how many posts to retrieve
     */
    getPosts: async (n: number): Promise<{ posts: Array<Post> | null; error: string | null }> => {
        try {
            const { data } = await API.post('', {
                query: GET_N_POSTS,
                variables: {
                    n,
                },
            });

            return {
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
                error: null,
            };
        } catch (error) {
            return {
                posts: null,
                error: `Error retrieving last ${n} posts`,
            };
        }
    },

    /**
     * Get a post by its slug.
     * @param slug the slug of the desired post.
     */
    getPostBySlug: async (slug: string): Promise<{ post: Post | null; error: string | null }> => {
        try {
            const { data } = await API.post('', {
                query: GET_POST_BY_SLUG,
                variables: {
                    slug,
                },
            });

            return {
                post: {
                    title: data.data.postCollection.items[0].title,
                    slug: data.data.postCollection.items[0].slug,
                    body: data.data.postCollection.items[0].body,
                    publishedAt: data.data.postCollection.items[0].sys.firstPublishedAt,
                    author: data.data.postCollection.items[0].author,
                },
                error: null,
            };
        } catch (error) {
            return {
                post: null,
                error: `Post '${slug}' not found`,
            };
        }
    },
};

export default PostAPI;
