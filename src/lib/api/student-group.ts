import axios from 'axios';
import { array, decodeType, nil, record, string, union } from 'typescript-json-decoder';
import handleError from './errors';
import { emptyArrayOnNilDecoder, slugDecoder } from './decoders';
import { SanityAPI } from '.';

type Profile = decodeType<typeof profileDecoder>;
const profileDecoder = record({
    name: string,
    imageUrl: union(string, nil),
});

type Member = decodeType<typeof memberDecoder>;
const memberDecoder = record({
    role: string,
    profile: profileDecoder,
});

type StudentGroup = decodeType<typeof studentGroupDecoder>;
const studentGroupDecoder = record({
    name: string,
    slug: string,
    info: string,
    members: (value) => emptyArrayOnNilDecoder(memberDecoder, value),
});

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
    ): Promise<{ studentGroups: Array<StudentGroup> | null; error: string | null }> => {
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

            return {
                studentGroups: array(studentGroupDecoder)(result),
                error: null,
            };
        } catch (error) {
            console.log(error); // eslint-disable-line
            return {
                studentGroups: [],
                error: handleError(axios.isAxiosError(error) ? error.response?.status ?? 500 : 500),
            };
        }
    },

    getStudentGroupBySlug: async (
        slug: string,
    ): Promise<{ studentGroup: StudentGroup | null; error: string | null }> => {
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
                    studentGroup: null,
                    error: '404',
                };
            }

            return {
                studentGroup: array(studentGroupDecoder)(result)[0],
                error: null,
            };
        } catch (error) {
            console.log(error); // eslint-disable-line
            if (axios.isAxiosError(error) && !error.response) {
                return {
                    studentGroup: null,
                    error: '404',
                };
            }

            return {
                studentGroup: null,
                error: handleError(axios.isAxiosError(error) ? error.response?.status ?? 500 : 500),
            };
        }
    },
};

export { StudentGroupAPI };
export type { Profile, Member, StudentGroup };
