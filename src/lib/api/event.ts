import { Event, Author } from '..';
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
    getPaths: async (): Promise<Array<string>> => {
        try {
            const { data } = await API.post('', {
                query: GET_PATHS,
            });

            return data.data.eventCollection.items.map((event: { slug: string }) => event.slug);
        } catch (error) {
            return [];
        }
    },

    getEvents: async (n: number): Promise<{ events: Array<Event> | null; error: string | null }> => {
        try {
            const { data } = await API.post('', {
                query: GET_N_EVENTS,
                variables: {
                    n,
                },
            });

            return {
                events: data.data.eventCollection.items.map(
                    (event: {
                        title: string;
                        slug: string;
                        date: string;
                        spots: number;
                        body: string;
                        image: {
                            url: string;
                        };
                        location: string;
                        sys: {
                            firstPublishedAt: string;
                        };
                        author: Author;
                    }) => {
                        return {
                            title: event.title,
                            slug: event.slug,
                            date: event.date,
                            spots: event.spots,
                            body: event.body,
                            imageUrl: event.image.url,
                            location: event.location,
                            publishedAt: event.sys.firstPublishedAt,
                            author: event.author,
                        };
                    },
                ),
                error: null,
            };
        } catch (error) {
            return {
                events: null,
                error: `Error retrieveing ${n} events`,
            };
        }
    },

    getEventBySlug: async (slug: string): Promise<{ event: Event | null; error: string | null }> => {
        try {
            const { data } = await API.post('', {
                query: GET_EVENT_BY_SLUG,
                variables: {
                    slug,
                },
            });

            return {
                event: {
                    title: data.data.eventCollection.items[0].title,
                    slug: data.data.eventCollection.items[0].slug,
                    date: data.data.eventCollection.items[0].date,
                    spots: data.data.eventCollection.items[0].spots,
                    body: data.data.eventCollection.items[0].body,
                    imageUrl: data.data.eventCollection.items[0].image.url,
                    location: data.data.eventCollection.items[0].location,
                    publishedAt: data.data.eventCollection.items[0].sys.firstPublishedAt,
                    author: data.data.eventCollection.items[0].author,
                },
                error: null,
            };
        } catch (error) {
            return {
                event: null,
                error: `Event '${slug} not found`,
            };
        }
    },
};

export default EventAPI;
