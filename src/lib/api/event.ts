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

const GET_N_EVENTS = `
    query ($n: Int!) {
        eventCollection(limit: $n) {
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

    getEvents: (n: number): Promise<AxiosResponse> =>
        API.post('', {
            query: GET_N_EVENTS,
            variables: {
                n,
            },
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
