import { z } from 'zod';
import type { ErrorMessage } from '@utils/error';
import { handleError } from '@utils/error';
import SanityAPI from '@api/sanity';

const happeningTypeSchema = z.enum(['BEDPRES', 'EVENT']);
type HappeningType = z.infer<typeof happeningTypeSchema>;

const questionSchema = z.object({
    questionText: z.string(),
    inputType: z.enum(['radio', 'textbox']),
    alternatives: z.array(z.string()).nullable(),
});
type Question = z.infer<typeof questionSchema>;

const spotRangeCounterSchema = z.object({
    spots: z.number(),
    minDegreeYear: z.number(),
    maxDegreeYear: z.number(),
    regCount: z.number(),
    waitListCount: z.number(),
});
type SpotRangeCount = z.infer<typeof spotRangeCounterSchema>;

const spotRangeSchema = z.object({
    spots: z.number(),
    minDegreeYear: z.number(),
    maxDegreeYear: z.number(),
});
type SpotRange = z.infer<typeof spotRangeSchema>;

const happeningSchema = z.object({
    _createdAt: z.string(),
    studentGroupName: z.enum(['hovedstyret', 'bedkom', 'webkom', 'gnist', 'tilde']),
    title: z.string(),
    slug: z.string(),
    date: z.string(),
    registrationDate: z.string().nullable(),
    registrationDeadline: z.string().nullable(),
    studentGroupRegistrationDate: z.string().nullable(),
    studentGroups: z.array(z.string()).nullable(),
    onlyForStudentGroups: z.boolean().nullable(),
    body: z.object({
        no: z.string(),
        en: z.string().optional(),
    }),
    deductiblePayment: z.string().nullable(),
    location: z.string(),
    locationLink: z.string().nullable(),
    companyLink: z.string().nullable(),
    logoUrl: z.string().nullable(),
    contactEmail: z.string().nullable(),
    additionalQuestions: z
        .array(questionSchema)
        .nullable()
        .transform((aq) => aq ?? []),
    spotRanges: z
        .array(spotRangeSchema)
        .nullable()
        .transform((sr) => sr ?? []),
    happeningType: happeningTypeSchema,
});
type Happening = z.infer<typeof happeningSchema>;

const happeningInfoSchema = z.object({
    spotRanges: z.array(spotRangeCounterSchema),
});
type HappeningInfo = z.infer<typeof happeningInfoSchema>;

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';

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
                    registrationDate,
                    registrationDeadline,
                    studentGroupRegistrationDate,
                    studentGroups,
                    onlyForStudentGroups,
                    body,
                    deductiblePayment,
                    location,
                    locationLink,
                    companyLink,
                    happeningType,
                    contactEmail,
                    additionalQuestions[] -> {
                        questionText,
                        inputType,
                        alternatives
                    },
                    "logoUrl": logo.asset -> url,
                    studentGroupName,
                    _createdAt,
                    spotRanges[] -> {
                        minDegreeYear,
                        maxDegreeYear,
                        spots
                    }
                }
                ${limit}
            `;

            const result = await SanityAPI.fetch(query);

            return happeningSchema.array().parse(result);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return { message: handleError(500) };
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
                    registrationDate,
                    registrationDeadline,
                    studentGroupRegistrationDate,
                    studentGroups,
                    onlyForStudentGroups,
                    body,
                    deductiblePayment,
                    location,
                    locationLink,
                    companyLink,
                    happeningType,
                    contactEmail,
                    additionalQuestions[] -> {
                        questionText,
                        inputType,
                        alternatives
                    },
                    "logoUrl": logo.asset -> url,
                    studentGroupName,
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
            return happeningSchema.parse(result[0]);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return { message: JSON.stringify(error) };
        }
    },

    getHappeningInfo: async (auth: string, slug: string): Promise<HappeningInfo | ErrorMessage> => {
        try {
            const response = await fetch(`${BACKEND_URL}/happening/${slug}`, {
                headers: {
                    Authorization: `Basic ${Buffer.from(`admin:${auth}`).toString('base64')}`,
                },
            });

            if (response.status === 200) {
                const result = await response.json();

                return happeningInfoSchema.parse(result);
            }

            return { message: `${response.status} ${response.statusText}` };
        } catch (error) {
            console.log(error); // eslint-disable-line
            return { message: JSON.stringify(error) };
        }
    },
};

export {
    happeningSchema,
    HappeningAPI,
    type SpotRange,
    type SpotRangeCount,
    type HappeningType,
    type Question,
    type Happening,
    type HappeningInfo,
};
