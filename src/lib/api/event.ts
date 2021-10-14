import axios from 'axios';
import { array, decodeType, nil, Pojo, record, string, union } from 'typescript-json-decoder';
import { SanityAPI } from './api';
import { questionDecoder, spotRangeDecoder } from './decoders';
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
        _createdAt: string,
        author: string,
        title: string,
        slug: string,
        date: string,
        body: string,
        location: string,
        imageUrl: union(string, nil),
        registrationTime: union(string, nil),
    });

    const additionalQuestionsDecoder = record({
        additionalQuestions: union(array(questionDecoder), nil),
    });

    const spotRangesDecoder = record({
        spotRanges: union(array(spotRangeDecoder), nil),
    });

    // We combine the base decoder with the decoders
    // for the nested fields, and return the final JSON object.
    // This object is of type Event.
    return {
        ...baseDecoder(value),
        additionalQuestions: additionalQuestionsDecoder(value).additionalQuestions || [],
        spotRanges: spotRangesDecoder(value).spotRanges || [],
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
            const query = `*[_type == "event"]{slug}`;
            const data = await SanityAPI.fetch(query);

            return eventSlugListDecoder(data).map((eventSlug) => eventSlug.slug);
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
            const limit = n === 0 ? `` : `[0...${n}]`;
            const query = `
                *[_type == "happening" && happeningType == "EVENT" && !(_id in path('drafts.**'))]{
                    title,
                    "slug": slug.current,
                    happeningType,
                    date,
                    body,
                    location,
                    "registrationTime": registrationDate,
                    "additionalQuestions": additionalQuestions[]->{
                        questionText,
                        inputType,
                        alternatives
                    },
                    "imageUrl": logo.asset -> url,
                    "author": author -> name,
                    _createdAt,
                    spotRanges[] -> {
                        minDegreeYear,
                        maxDegreeYear,
                        spots
                    }
                }${limit}
            `;
            const data = await SanityAPI.fetch(query);

            return {
                events: eventListDecoder(data),
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
            const query = `
                *[_type == "happening" && happeningType == "EVENT" && slug.current == "${slug}" && !(_id in path('drafts.**'))]{
                    title,
                    "slug": slug.current,
                    happeningType,
                    date,
                    body,
                    location,
                    "registrationTime": registrationDate,
                    "additionalQuestions": additionalQuestions[]->{
                        questionText,
                        inputType,
                        alternatives
                    },
                    "imageUrl": logo.asset -> url,
                    "author": author -> name,
                    _createdAt,
                    spotRanges[] -> {
                        minDegreeYear,
                        maxDegreeYear,
                        spots
                    }
                }
            `;
            const data = await SanityAPI.fetch(query);

            if (data.length === 0) throw new Error();

            return {
                event: eventListDecoder(data)[0],
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
