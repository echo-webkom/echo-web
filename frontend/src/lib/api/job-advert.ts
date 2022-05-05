import axios from 'axios';
import { array } from 'typescript-json-decoder';
import SanityAPI from './api';
import { slugDecoder, jobAdvertDecoder } from './decoders';
import { ErrorMessage, Slug, JobAdvert } from './types';

const JobAdvertAPI = {
    getPaths: async (): Promise<Array<string>> => {
        try {
            const query = `*[_type == "jobAdvert"]{ "slug": slug.current }`;
            const result = await SanityAPI.fetch(query);

            return array(slugDecoder)(result).map((nestedSlug: Slug) => nestedSlug.slug);
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
            return { message: axios.isAxiosError(error) ? error.message : 'Fail @ getJobAdverts' };
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
            return { message: axios.isAxiosError(error) ? error.message : 'Fail @ getJobAdvertBySlug' };
        }
    },
};

/* eslint-disable import/prefer-default-export */
export { JobAdvertAPI };
