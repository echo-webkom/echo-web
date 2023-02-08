import { z } from 'zod';
import { groq } from 'next-sanity';
import SanityAPI from '@api/sanity';
import { slugSchema } from '@utils/schemas';
import type { ErrorMessage } from '@utils/error';

const jobAdvertSchema = z.object({
    slug: z.string(),
    body: z.string(),
    companyName: z.string(),
    title: z.string(),
    logoUrl: z.string(),
    deadline: z.string(),
    locations: z.array(z.string()),
    advertLink: z.string(),
    jobType: z.enum(['fulltime', 'parttime', 'internship', 'summerjob']),
    degreeYears: z.array(z.number()),
    _createdAt: z.string(),
    weight: z.number(),
});
type JobAdvert = z.infer<typeof jobAdvertSchema>;

const JobAdvertAPI = {
    getPaths: async (): Promise<Array<string>> => {
        try {
            const query = `*[_type == "jobAdvert"]{ "slug": slug.current }`;
            const result = await SanityAPI.fetch(query);

            return slugSchema
                .array()
                .parse(result)
                .map((nestedSlug) => nestedSlug.slug);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return [];
        }
    },

    getJobAdverts: async (n: number): Promise<Array<JobAdvert> | ErrorMessage> => {
        try {
            const query = groq`*[_type == "jobAdvert" && !(_id in path('drafts.**'))] | order(_createdAt desc) [0..${
                n - 1
            }] {
                    "slug": slug.current,
                    body,
                    companyName,
                    title,
                    "logoUrl": logo.asset -> url,
                    deadline,
                    locations,
                    advertLink,
                    jobType,
                    degreeYears,
                    _createdAt,
                    weight
                }`;
            const result = await SanityAPI.fetch(query);

            return jobAdvertSchema.array().parse(result);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return { message: JSON.stringify(error) };
        }
    },

    getJobAdvertBySlug: async (slug: string): Promise<JobAdvert | ErrorMessage> => {
        try {
            const query = groq`
                *[_type == "jobAdvert" && slug.current == "${slug}" && !(_id in path('drafts.**'))] {
                    "slug": slug.current,
                    body,
                    companyName,
                    title,
                    "logoUrl": logo.asset -> url,
                    deadline,
                    locations,
                    advertLink,
                    jobType,
                    degreeYears,
                    _createdAt,
                    weight
                }`;
            const result = await SanityAPI.fetch(query);

            return jobAdvertSchema.parse(result[0]);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return { message: JSON.stringify(error) };
        }
    },
};

export { JobAdvertAPI, type JobAdvert };
