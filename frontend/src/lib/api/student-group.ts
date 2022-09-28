import axios from 'axios';
import type { decodeType } from 'typescript-json-decoder';
import { array, record, string, union, nil } from 'typescript-json-decoder';
import { profileDecoder } from './profile';
import SanityAPI from '@api/sanity';
import type { ErrorMessage } from '@utils/error';
import { slugDecoder, emptyArrayOnNilDecoder } from '@utils/decoders';

const memberDecoder = record({
    role: string,
    profile: profileDecoder,
});
type Member = decodeType<typeof memberDecoder>;

const studentGroupDecoder = record({
    name: string,
    slug: string,
    info: union(string, nil),
    imageUrl: union(string, nil),
    members: (value) => emptyArrayOnNilDecoder(memberDecoder, value),
});
type StudentGroup = decodeType<typeof studentGroupDecoder>;

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

    getPathsByType: async (
        type: 'board' | 'suborg' | 'subgroup' | 'intgroup',
    ): Promise<Array<string> | ErrorMessage> => {
        try {
            const query = `*[_type == "studentGroup" && groupType == "${type}" && !(_id in path('drafts.**'))]{ "slug": slug.current }`;
            const result = await SanityAPI.fetch(query);

            return array(slugDecoder)(result).map((nestedSlug) => nestedSlug.slug);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return {
                message: axios.isAxiosError(error) ? error.message : 'Fail @ getStudentGroupsByType',
            };
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
                    "imageUrl": grpPicture.asset -> url,
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
                    "imageUrl": grpPicture.asset -> url,
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

export { StudentGroupAPI, type Member, type StudentGroup };
