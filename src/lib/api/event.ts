import { formatISO } from 'date-fns';
import { nil, union, Pojo, record, array, string, number, decodeType } from 'typescript-json-decoder';
import API from './api';
import { GET_EVENT_PATHS, GET_N_EVENTS, GET_EVENT_BY_SLUG } from './schema';
import { authorDecoder, publishedAtDecoder } from './decoders';
import handleError from './errors';

// Automatically creates the Event type with the
// fields we specify in our eventDecoder.
export type Event = decodeType<typeof eventDecoder>;

const eventDecoder = (value: Pojo) => {
    // Defines the structure of the JSON object we
    // are trying to decode, WITHOUT any fields
    // that are nested.
    //
    // For example, the field "author" is nested;
    //      author: { authorName: string }
    //
    // We need to define additional decoders
    // for these nested fields.
    const baseDecoder = record({
        title: string,
        slug: string,
        spots: union(number, nil),
        date: string,
        body: string,
        location: string,
    });

    // Decoders for nested fields.
    const imageUrlDecoder = record({
        image: union(
            record({
                url: string,
            }),
            nil,
        ),
    });

    // We combine the base decoder with the decoders
    // for the nested fields, and return the final JSON object.
    // This object is of type Event.
    return {
        ...baseDecoder(value),
        author: authorDecoder(value).author.authorName,
        imageUrl: imageUrlDecoder(value).image?.url || null,
        publishedAt: publishedAtDecoder(value).sys.firstPublishedAt,
    };
};

// Decode a list of Event's.
const eventListDecoder = array(eventDecoder);

// Decoder for eventSlug.
// We don't infer type since it's not needed anywhere.
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
     * Get the n last published events.
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
                error: handleError(error.response.status),
            };
        }
    },

    /**
     * Get an event by its slug.
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

            if (data.data.eventCollection.items.length === 0) throw new Error();

            return {
                event: eventListDecoder(data.data.eventCollection.items)[0],
                error: null,
            };
        } catch (error) {
            if (!error.response) {
                return {
                    event: null,
                    error: '404',
                };
            }

            return {
                event: null,
                error: handleError(error.response.status),
            };
        }
    },
};
