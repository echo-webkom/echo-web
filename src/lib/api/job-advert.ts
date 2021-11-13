import axios from 'axios';
import { array, decodeType, literal, number, record, string, union } from 'typescript-json-decoder';
import SanityAPI from './api';
import handleError from './errors';

type JobAdvert = decodeType<typeof jobAdvertDecoder>;
const jobAdvertDecoder = record({
    slug: string,
    body: string,
    companyName: string,
    title: string,
    logoUrl: string,
    deadline: string,
    location: string,
    advertLink: string,
    jobType: union(literal('fulltime'), literal('parttime'), literal('internship')),
    degreeYears: array(number),
    _createdAt: string,
});

type JobAdvertSlug = decodeType<typeof jobAdvertSlugDecoder>;
const jobAdvertSlugDecoder = record({
    slug: string,
});

const JobAdvertAPI = {
    getPaths: async (): Promise<Array<string>> => {
        try {
            const query = `*[_type == "jobAdvert"]{ "slug": slug.current }`;
            const result = await SanityAPI.fetch(query);

            return array(jobAdvertSlugDecoder)(result).map((nestedSlug: JobAdvertSlug) => nestedSlug.slug);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return [];
        }
    },

    getJobAdverts: async (n: number): Promise<{ jobAdverts: Array<JobAdvert> | null; error: string | null }> => {
        try {
            const query = `*[_type == "jobAdvert" && !(_id in path('drafts.**'))] | order(_createdAt desc) [0..${n}] {
                    "slug": slug.current,
                    body,
                    companyName,
                    title,
                    "logoUrl": logo.asset -> url,
                    deadline,
                    location,
                    advertLink,
                    jobType,
                    degreeYears,
                    _createdAt
                }`;
            const result = await SanityAPI.fetch(query);

            return {
                jobAdverts: array(jobAdvertDecoder)(result),
                error: null,
            };
        } catch (error) {
            console.log(error); // eslint-disable-line
            return {
                jobAdverts: null,
                error: handleError(axios.isAxiosError(error) ? error.response?.status || 500 : 500),
            };
        }
    },

    getJobAdvertBySlug: async (slug: string): Promise<{ jobAdvert: JobAdvert | null; error: string | null }> => {
        try {
            const query = `
                *[_type == "jobAdvert" && slug.current == "${slug}" && !(_id in path('drafts.**'))] {
                    "slug": slug.current,
                    body,
                    companyName,
                    title,
                    "logoUrl": logo.asset -> url,
                    deadline,
                    location,
                    advertLink,
                    jobType,
                    degreeYears,
                    _createdAt
                }`;
            const result = await SanityAPI.fetch(query);

            return {
                jobAdvert: array(jobAdvertDecoder)(result)[0],
                error: null,
            };
        } catch (error) {
            console.log(error); // eslint-disable-line
            return {
                jobAdvert: null,
                error: handleError(axios.isAxiosError(error) ? error.response?.status || 500 : 500),
            };
        }
    },
};

export { JobAdvertAPI };
export type { JobAdvert };
