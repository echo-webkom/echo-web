import axios from 'axios';
import { array, decodeType, nil, Pojo, record, string, union } from 'typescript-json-decoder';
import { SanityAPI } from './api';
import handleError from './errors';

export type Profile = decodeType<typeof profileDecoder>;
const profileDecoder = (value: Pojo) => {
    const baseDecoder = record({
        name: string,
        imageUrl: union(string, nil),
    });

    return {
        ...baseDecoder(value),
    };
};

export type Role = decodeType<typeof roleDecoder>;
const roleDecoder = (value: Pojo) => {
    const baseDecoder = record({
        name: string,
    });

    const profileListDecoder = record({
        members: union(array(profileDecoder), nil),
    });

    return {
        ...baseDecoder(value),
        members: profileListDecoder(value).members || [],
    };
};

export type StudentGroup = decodeType<typeof studentGroupDecoder>;
const studentGroupDecoder = (value: Pojo) => {
    const baseDecoder = record({
        name: string,
        info: string,
    });

    const roleListDecoder = record({
        roles: array(roleDecoder),
    });

    return {
        ...baseDecoder(value),
        roles: roleListDecoder(value).roles,
    };
};

const studentGroupListDecoder = array(studentGroupDecoder);

export const StudentGroupAPI = {
    getStudentGroupsByType: async (
        type: 'board' | 'suborg' | 'subgroup',
    ): Promise<{ studentGroups: Array<StudentGroup> | null; error: string | null }> => {
        try {
            const query = `
                *[_type == "studentGroup" && groupType == "${type}"] | order(name) {
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
                studentGroups: studentGroupListDecoder(result),
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
