import axios from 'axios';
import { array, decodeType, nil, number, Pojo, record, string, union } from 'typescript-json-decoder';
import API from './api';
import { authorDecoder, publishedAtDecoder, questionDecoder } from './decoders';
import handleError from './errors';
import { GET_EVENT_BY_SLUG, GET_EVENT_PATHS, GET_N_EVENTS } from './schema';

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
        date: string,
        spots: union(number, nil),
        body: string,
        location: string,
        registrationTime: union(string, nil),
        minDegreeYear: union(number, nil),
        maxDegreeYear: union(number, nil),
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

    const additionalQuestionsDecoder = record({
        additionalQuestionsCollection: record({
            items: array(questionDecoder),
        }),
    });

    // We combine the base decoder with the decoders
    // for the nested fields, and return the final JSON object.
    // This object is of type Event.
    return {
        ...baseDecoder(value),
        imageUrl: imageUrlDecoder(value).image?.url || null,
        additionalQuestions: additionalQuestionsDecoder(value).additionalQuestionsCollection.items,
        publishedAt: publishedAtDecoder(value).sys.firstPublishedAt,
        author: authorDecoder(value).author.authorName,
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
            console.log(error); // eslint-disable-line
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
                },
            });

            return {
                events: eventListDecoder(data.data.eventCollection.items),
                error: null,
            };
        } catch (error) {
            console.log(error); // eslint-disable-line
            return {
                events: null,
                error: handleError(axios.isAxiosError(error) ? error.response?.status || 500 : 500),
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
            console.log(error); // eslint-disable-line
            if (axios.isAxiosError(error)) {
                if (!error.response) {
                    return {
                        event: null,
                        error: '404',
                    };
                }
                return {
                    event: null,
                    error: handleError(error.response?.status),
                };
            }

            return {
                event: null,
                error: handleError(500),
            };
        }
    },
};
