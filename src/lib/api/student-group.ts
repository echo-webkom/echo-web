import axios from 'axios';
import { array, decodeType, nil, record, string, union } from 'typescript-json-decoder';
import { SanityAPI } from './api';
import handleError from './errors';
import { emptyArrayOnNilDecoder } from './decoders';

export type Profile = decodeType<typeof profileDecoder>;
const profileDecoder = record({
    name: string,
    imageUrl: union(string, nil),
});

export type Member = decodeType<typeof memberDecoder>;
const memberDecoder = record({
    role: string,
    profile: profileDecoder,
});

export type StudentGroup = decodeType<typeof studentGroupDecoder>;
const studentGroupDecoder = record({
    name: string,
    info: string,
    members: (value) => emptyArrayOnNilDecoder(memberDecoder, value),
});

export const StudentGroupAPI = {
    getStudentGroupsByType: async (
        type: 'board' | 'suborg' | 'subgroup' | 'intgroup',
    ): Promise<{ studentGroups: Array<StudentGroup> | null; error: string | null }> => {
        try {
            const query = `
                *[_type == "studentGroup" && groupType == "${type}" && !(_id in path('drafts.**'))] | order(name) {
                    name,
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
                error: handleError(axios.isAxiosError(error) ? error.response?.status || 500 : 500),
            };
        }
    },
};
