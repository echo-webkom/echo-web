import axios from 'axios';
import { array } from 'typescript-json-decoder';
import { happeningDecoder } from './decoders';
import { ErrorMessage, Happening, HappeningType } from './types';
import handleError from './errors';
import { SanityAPI } from '.';

// Automatically creates the Happening type with the
// fields we specify in our happeningDecoder.

const HappeningAPI = {
    /**
     * Get the n last happeninges.
     * @param n how many happeninges to retrieve
     */
    getHappeningsByType: async (n: number, type: HappeningType): Promise<Array<Happening> | ErrorMessage> => {
        try {
            const limit = n === 0 ? `` : `[0...${n}]`;
            const query = `
                *[_type == "happening" && happeningType == "${type}" && !(_id in path('drafts.**'))] | order(date asc) {
                    title,
                    "slug": slug.current,
                    date,
                    body,
                    location,
                    locationLink,
                    companyLink,
                    happeningType,
                    registrationDate,
                    contactEmail,
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

            const result = await SanityAPI.fetch(query);

            return array(happeningDecoder)(result);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return { message: handleError(axios.isAxiosError(error) ? error.response?.status ?? 500 : 500) };
        }
    },

    /**
     * Get a happening by its slug.
     * @param slug the slug of the desired happening.
     */
    getHappeningBySlug: async (slug: string): Promise<Happening | ErrorMessage> => {
        try {
            const query = `
                *[_type == "happening" && slug.current == "${slug}" && !(_id in path('drafts.**'))]{
                    title,
                    "slug": slug.current,
                    date,
                    body,
                    location,
                    locationLink,
                    companyLink,
                    happeningType,
                    registrationDate,
                    contactEmail,
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

            const result = await SanityAPI.fetch(query);

            if (result.length === 0) {
                return {
                    message: '404',
                };
            }

            // Sanity returns a list with a single element,
            // therefore we need [0] to get the element out of the list.
            return array(happeningDecoder)(result)[0];
        } catch (error) {
            console.log(error); // eslint-disable-line
            if (axios.isAxiosError(error)) {
                return { message: !error.response ? '404' : error.message };
            }

            return {
                message: 'Fail @ getHappeningsBySlug',
            };
        }
    },
};

/* eslint-disable import/prefer-default-export */
export { HappeningAPI };
