import { Author, Post } from '..';
import API from './api';

const GET_PATHS = `
    query {
        postCollection(limit: 10) {
            items {
                slug
            }
        }
    }
`;

const GET_N_POSTS = `
    query ($n: Int!) {
        postCollection(limit: $n) {
            items {
                title
                slug
                body
                author {
                    authorName
                }
                sys {
                    firstPublishedAt
                }
            }
        }
    }
`;

const GET_POST_BY_SLUG = `
    query ($slug: String!) {
        postCollection(where: { slug: $slug }) {
            items {
                title
                slug
                body
                author {
                    authorName
                }
                sys {
                    firstPublishedAt
                }
            }
        }
    }
`;

const PostAPI = {
    getPaths: async (): Promise<Array<string>> => {
        try {
            const { data } = await API.post('', {
                query: GET_PATHS,
            });

            return data.data.postCollection.items.map((post: { slug: string }) => post.slug);
        } catch (error) {
            return [];
        }
    },

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
