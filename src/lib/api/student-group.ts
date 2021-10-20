import axios from 'axios';
import { array, decodeType, nil, record, string, union } from 'typescript-json-decoder';
import { SanityAPI } from './api';
import { emptyArrayOnNilDecoder } from './decoders';
import handleError from './errors';

export type Profile = decodeType<typeof profileDecoder>;
const profileDecoder = record({
    name: string,
    imageUrl: union(string, nil),
});

export type Role = decodeType<typeof roleDecoder>;
const roleDecoder = record({
    name: string,
    members: (value) => emptyArrayOnNilDecoder(profileDecoder, value),
});

export type StudentGroup = decodeType<typeof studentGroupDecoder>;
const studentGroupDecoder = record({
    name: string,
    info: string,
    roles: array(roleDecoder),
});

export const StudentGroupAPI = {
    getStudentGroupsByType: async (
        type: 'board' | 'suborg' | 'subgroup',
    ): Promise<{ studentGroups: Array<StudentGroup> | null; error: string | null }> => {
        try {
            const query = `
                *[_type == "studentGroup" && groupType == "${type}" && !(_id in path('drafts.**'))] | order(name) {
                    name,
                    info,
                    "roles": roles[] -> {
                        name,
                        "members": members[] -> {
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
