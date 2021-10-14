import axios from 'axios';
import { array, decodeType, nil, Pojo, record, string, union } from 'typescript-json-decoder';
import { SanityAPI } from './api';
import { questionDecoder, spotRangeDecoder } from './decoders';
import handleError from './errors';

// Automatically creates the Bedpres type with the
// fields we specify in our bedpresDecoder.
export type Bedpres = decodeType<typeof bedpresDecoder>;
const bedpresDecoder = (value: Pojo) => {
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
        companyLink: string,
        registrationTime: string,
        logoUrl: string,
    });

    const additionalQuestionsDecoder = record({
        additionalQuestions: union(array(questionDecoder), nil),
    });

    const spotRangesDecoder = record({
        spotRanges: union(array(spotRangeDecoder), nil),
    });

    // We combine the base decoder with the decoders
    // for the nested fields, and return the final JSON object.
    // This object is of type Bedpres.
    return {
        ...baseDecoder(value),
        additionalQuestions: additionalQuestionsDecoder(value).additionalQuestions || [],
        spotRanges: spotRangesDecoder(value).spotRanges || [],
    };
};

// Same as bedpresDecoder, but for a list of bedpreses.
const bedpresListDecoder = array(bedpresDecoder);

export const BedpresAPI = {
    /**
     * Get the n last bedpreses.
     * @param n how many bedpreses to retrieve
     */
    getBedpreses: async (n: number): Promise<{ bedpreses: Array<Bedpres> | null; error: string | null }> => {
        try {
            const limit = n === 0 ? `` : `[0...${n}]`;
            const query = `
                *[_type == "happening" && happeningType == "BEDPRES" && !(_id in path('drafts.**'))] | order(date asc){
                    title,
                    "slug": slug.current,
                    date,
                    body,
                    location,
                    companyLink,
                    "registrationTime": registrationDate,
                    additionalQuestions[] -> {
                        questionText,
                        inputType,
                        alternatives
                    },
                    "logoUrl": logo.asset -> url,
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
                bedpreses: bedpresListDecoder(data),
                error: null,
            };
        } catch (error) {
            console.log(error); // eslint-disable-line
            return {
                bedpreses: null,
                error: handleError(axios.isAxiosError(error) ? error.response?.status || 500 : 500),
            };
        }
    },

    /**
     * Get a bedpres by its slug.
     * @param slug the slug of the desired bedpres.
     */
    getBedpresBySlug: async (slug: string): Promise<{ bedpres: Bedpres | null; error: string | null }> => {
        try {
            const query = `
                *[_type == "happening" && happeningType == "BEDPRES" && slug.current == "${slug}" && !(_id in path('drafts.**'))]{
                    title,
                    "slug": slug.current,
                    date,
                    body,
                    location,
                    companyLink,
                    "registrationTime": registrationDate,
                    additionalQuestions[] -> {
                        questionText,
                        inputType,
                        alternatives
                    },
                    "logoUrl": logo.asset -> url,
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
                // Sanity returns a list with a single element,
                // therefore we need [0] to get the element out of the list.
                bedpres: bedpresListDecoder(data)[0] || null,
                error: null,
            };
        } catch (error) {
            console.log(error); // eslint-disable-line
            if (axios.isAxiosError(error)) {
                if (!error.response) {
                    return {
                        bedpres: null,
                        error: '404',
                    };
                }
                return {
                    bedpres: null,
                    error: handleError(error.response?.status),
                };
            }

            return {
                bedpres: null,
                error: handleError(500),
            };
        }
    },
};
