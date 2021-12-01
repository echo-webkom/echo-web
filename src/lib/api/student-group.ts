import axios from 'axios';
import { array, decodeType, nil, record, string, union } from 'typescript-json-decoder';
import handleError from './errors';
import { emptyArrayOnNilDecoder } from './decoders';
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
    info: string,
    members: (value) => emptyArrayOnNilDecoder(memberDecoder, value),
});

const StudentGroupAPI = {
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
                error: handleError(axios.isAxiosError(error) ? error.response?.status ?? 500 : 500),
            };
        }
    },
};

export { StudentGroupAPI };
export type { Profile, Member, StudentGroup };
