import type { decodeType } from 'typescript-json-decoder';
import { array, string, record, literal, union, number } from 'typescript-json-decoder';
import SanityAPI from '@api/sanity';
import { slugDecoder } from '@utils/decoders';
import type { ErrorMessage } from '@utils/error';

const jobAdvertDecoder = record({
    slug: string,
    body: string,
    companyName: string,
    title: string,
    logoUrl: string,
    deadline: string,
    locations: array(string),
    advertLink: string,
    jobType: union(literal('fulltime'), literal('parttime'), literal('internship'), literal('summerjob')),
    degreeYears: array(number),
    _createdAt: string,
    weight: number,
});

type JobAdvert = decodeType<typeof jobAdvertDecoder>;

const JobAdvertAPI = {
    getPaths: async (): Promise<Array<string>> => {
        try {
            const query = `*[_type == "jobAdvert"]{ "slug": slug.current }`;
            const result = await SanityAPI.fetch(query);

            return array(slugDecoder)(result).map((nestedSlug) => nestedSlug.slug);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return [];
        }
    },

    getJobAdverts: async (n: number): Promise<Array<JobAdvert> | ErrorMessage> => {
        try {
            const query = `*[_type == "jobAdvert" && !(_id in path('drafts.**'))] | order(_createdAt desc) [0..${
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

            return array(jobAdvertDecoder)(result);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return { message: JSON.stringify(error) };
        }
    },

    getJobAdvertBySlug: async (slug: string): Promise<JobAdvert | ErrorMessage> => {
        try {
            const query = `
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

            return array(jobAdvertDecoder)(result)[0];
        } catch (error) {
            console.log(error); // eslint-disable-line
            return { message: JSON.stringify(error) };
        }
    },
};

export { JobAdvertAPI, type JobAdvert };
