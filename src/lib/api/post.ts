import { AxiosResponse } from 'axios';
import API from './api';

const GET_N_PATHS = `
    query ($n: Int!) {
        postCollection(limit: $n) {
            items {
                slug
            }
        }
    }
`;

const GET_ALL_SLUGS = `
    query {
        postCollection {
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
    getPaths: (): Promise<AxiosResponse> =>
        API.post('', {
            query: GET_N_PATHS,
            variables: {
                n: 10,
            },
        }),

    getPosts: (n: number): Promise<AxiosResponse> =>
        API.post('', {
            query: GET_N_POSTS,
            variables: {
                n,
            },
        }),

    getPostBySlug: (slug: string): Promise<AxiosResponse> =>
        API.post('', {
            query: GET_POST_BY_SLUG,
            variables: {
                slug,
            },
        }),

    getTotalPosts: (): Promise<AxiosResponse> =>
        API.post('', {
            query: GET_ALL_SLUGS,
        }),
};

export default PostAPI;
