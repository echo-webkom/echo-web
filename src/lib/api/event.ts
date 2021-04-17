import { formatISO } from 'date-fns';
import { nil, union, Pojo, record, array, string, number, decodeType } from 'typescript-json-decoder';
import API from './api';
import { GET_EVENT_PATHS, GET_N_EVENTS, GET_EVENT_BY_SLUG } from './schema';
import { authorDecoder, publishedAtDecoder } from './decoders';

export type Event = decodeType<typeof eventDecoder>;
const eventDecoder = (value: Pojo) => {
    const baseDecoder = record({
        title: string,
        slug: string,
        spots: union(number, nil),
        date: string,
        body: string,
        location: string,
    });

    const imageUrlDecoder = record({
        image: union(
            record({
                url: string,
            }),
            nil,
        ),
    });

    return {
        ...baseDecoder(value),
        author: authorDecoder(value).author.authorName,
        imageUrl: imageUrlDecoder(value).image?.url || null,
        publishedAt: publishedAtDecoder(value).sys.firstPublishedAt,
    };
};

const eventListDecoder = array(eventDecoder);

const eventSlugDecoder = record({
    slug: string,
});

const eventSlugListDecoder = array(eventSlugDecoder);

export const EventAPI = {
    /**
     * Get the slugs of the 10 lasts events.
     * This data is used to statically generate the pages of the 10 last published events.
     */
    getPaths: async (): Promise<Array<string>> => {
        try {
            const { data } = await API.post('', {
                query: GET_EVENT_PATHS,
            });

            return eventSlugListDecoder(data.data.eventCollection.items).map((eventSlug) => eventSlug.slug);
        } catch (error) {
            return [];
        }
    },

    /**
     * Get the n last published events
     * @param n how many events to retrieve
     */
    getEvents: async (n: number): Promise<{ events: Array<Event> | null; error: string | null }> => {
        try {
            const { data } = await API.post('', {
                query: GET_N_EVENTS,
                variables: {
                    n,
                    date: formatISO(new Date()),
                },
            });

            return {
                events: eventListDecoder(data.data.eventCollection.items),
                error: null,
            };
        } catch (error) {
            return {
                events: null,
                error: `Error retrieveing ${n} events`,
            };
        }
    },

    /**
     * Get an event by its slug
     * @param slug the slug of the desired event
     */
    getEventBySlug: async (slug: string): Promise<{ event: Event | null; error: string | null }> => {
        try {
            const { data } = await API.post('', {
                query: GET_EVENT_BY_SLUG,
                variables: {
                    slug,
                },
            });

            return {
                event: eventListDecoder(data.data.eventCollection.items)[0],
                error: null,
            };
        } catch (error) {
            return {
                event: null,
                error: `Event '${slug}' not found`,
            };
        }
    },
};
