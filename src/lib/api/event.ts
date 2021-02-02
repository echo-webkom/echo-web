import { AxiosResponse } from 'axios';
import API from './api';

const GET_PATHS = `
    query {
        eventCollection(limit: 10) {
            items {
                slug
            }
        }
    }
`;

const GET_EVENT_BY_SLUG = `
    query ($slug: String!) {
        eventCollection(where: { slug: $slug }) {
            items {
                title
                slug
                date
                spots
                body
                image {
                    url
                }
                location
                sys {
                    firstPublishedAt
                }
                author {
                    authorName
                }
            }
        }
    }
`;

const EventAPI = {
    getPaths: (): Promise<AxiosResponse> =>
        API.post('', {
            query: GET_PATHS,
        }),

    getEventBySlug: (slug: string): Promise<AxiosResponse> =>
        API.post('', {
            query: GET_EVENT_BY_SLUG,
            variables: {
                slug,
            },
        }),
};

export default EventAPI;
