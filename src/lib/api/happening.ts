import axios from 'axios';
import { array, decodeType, record, string, union, nil } from 'typescript-json-decoder';
import { emptyArrayOnNilDecoder, spotRangeDecoder, questionDecoder } from './decoders';
import handleError from './errors';
import { SanityAPI } from '.';

// Automatically creates the Happening type with the
// fields we specify in our happeningDecoder.
type Happening = decodeType<typeof happeningDecoder>;
const happeningDecoder = record({
    _createdAt: string,
    author: string,
    title: string,
    slug: string,
    date: string,
    body: string,
    location: string,
    companyLink: union(string, nil),
    registrationDate: union(string, nil),
    logoUrl: union(string, nil),
    contactEmail: union(string, nil),
    additionalQuestions: (value) => emptyArrayOnNilDecoder(questionDecoder, value),
    spotRanges: (value) => emptyArrayOnNilDecoder(spotRangeDecoder, value),
    happeningType: (value) => {
        if (value === 'BEDPRES' || value === 'bedpres') return HappeningType.BEDPRES;
        else if (value === 'EVENT' || value === 'event') return HappeningType.EVENT;
        else throw new Error(`Could not decode value '${JSON.stringify(value)}' to a HappeningType`);
    },
});

enum HappeningType {
    BEDPRES = 'BEDPRES',
    EVENT = 'EVENT',
}

const HappeningAPI = {
    /**
     * Get the n last happeninges.
     * @param n how many happeninges to retrieve
     */
    getHappeningsByType: async (
        n: number,
        type: HappeningType,
    ): Promise<{ happenings: Array<Happening> | null; error: string | null }> => {
        try {
            const limit = n === 0 ? `` : `[0...${n}]`;
            const query = `
                *[_type == "happening" && happeningType == "${type}" && !(_id in path('drafts.**'))] | order(date asc) {
                    title,
                    "slug": slug.current,
                    date,
                    body,
                    location,
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

            return {
                happenings: array(happeningDecoder)(result),
                error: null,
            };
        } catch (error) {
            console.log(error); // eslint-disable-line
            return {
                happenings: null,
                error: handleError(axios.isAxiosError(error) ? error.response?.status ?? 500 : 500),
            };
        }
    },

    /**
     * Get a happening by its slug.
     * @param slug the slug of the desired happening.
     */
    getHappeningBySlug: async (slug: string): Promise<{ happening: Happening | null; error: string | null }> => {
        try {
            const query = `
                *[_type == "happening" && slug.current == "${slug}" && !(_id in path('drafts.**'))]{
                    title,
                    "slug": slug.current,
                    date,
                    body,
                    location,
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
                    happening: null,
                    error: '404',
                };
            }

            return {
                // Sanity returns a list with a single element,
                // therefore we need [0] to get the element out of the list.
                happening: array(happeningDecoder)(result)[0],
                error: null,
            };
        } catch (error) {
            console.log(error); // eslint-disable-line
            if (axios.isAxiosError(error)) {
                if (!error.response) {
                    return {
                        happening: null,
                        error: '404',
                    };
                }
                return {
                    happening: null,
                    error: handleError(error.response.status),
                };
            }

            return {
                happening: null,
                error: handleError(500),
            };
        }
    },
};

export { HappeningType, HappeningAPI };
export type { Happening };
