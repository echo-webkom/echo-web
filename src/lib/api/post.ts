import { AxiosResponse } from 'axios';
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
            query: GET_PATHS,
        }),

    getPostBySlug: (slug: string): Promise<AxiosResponse> =>
        API.post('', {
            query: GET_POST_BY_SLUG,
            variables: {
                slug,
            },
        }),
};

export default PostAPI;
