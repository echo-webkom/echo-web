import axios from 'axios';
import { array } from 'typescript-json-decoder';
import { slugDecoder, studentGroupDecoder } from './decoders';
import { ErrorMessage, StudentGroup } from './types';
import { SanityAPI } from '.';

const StudentGroupAPI = {
    getPaths: async (): Promise<Array<string>> => {
        try {
            const query = `*[_type == "studentGroup"]{ "slug": slug.current }`;
            const result = await SanityAPI.fetch(query);

            return array(slugDecoder)(result).map((nestedSlug) => nestedSlug.slug);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return [];
        }
    },

    getStudentGroupsByType: async (
        type: 'board' | 'suborg' | 'subgroup' | 'intgroup',
    ): Promise<Array<StudentGroup> | ErrorMessage> => {
        try {
            const query = `
                *[_type == "studentGroup" && groupType == "${type}" && !(_id in path('drafts.**'))] | order(name) {
                    name,
                    "slug": slug.current,
                    info,
                    "members": members[] {
                        role,
                        "profile": profile -> {
                            name,
                            "imageUrl": picture.asset -> url
                        }
                    }
                }
            `;
            const result = await SanityAPI.fetch(query);

            return array(studentGroupDecoder)(result);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return {
                message: axios.isAxiosError(error) ? error.message : 'Fail @ getStudentGroupsByType',
            };
        }
    },

    getStudentGroupBySlug: async (slug: string): Promise<StudentGroup | ErrorMessage> => {
        try {
            const query = `
                *[_type == "studentGroup" && slug.current == "${slug}" && !(_id in path('drafts.**'))] | order(name) {
                    name,
                    "slug": slug.current,
                    info,
                    "members": members[] {
                        role,
                        "profile": profile -> {
                            name,
                            "imageUrl": picture.asset -> url
                        }
                    }
                }`;
            const result = await SanityAPI.fetch(query);

            if (result.length === 0) {
                return {
                    message: '404',
                };
            }

            return array(studentGroupDecoder)(result)[0];
        } catch (error) {
            console.log(error); // eslint-disable-line
            if (axios.isAxiosError(error) && !error.response) {
                return {
                    message: '404',
                };
            }

            return {
                message: axios.isAxiosError(error) ? error.message : 'Fail @ getStudentGroupBySlug',
            };
        }
    },
};

/* eslint-disable import/prefer-default-export */
export { StudentGroupAPI };
