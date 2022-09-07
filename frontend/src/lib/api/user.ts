import axios from 'axios';
import type { decodeType } from 'typescript-json-decoder';
import { string, record, union, nil, number, array } from 'typescript-json-decoder';
import type { ErrorMessage } from '@utils/error';
import type { Degree } from '@utils/decoders';
import { degreeDecoder } from '@utils/decoders';

// Values directly from the form (aka form fields)
interface FormValues {
    alternateEmail: string;
    degree: Degree;
    degreeYear: number;
}

const userWithNameDecoder = record({
    email: string,
    alternateEmail: union(string, nil),
    name: string,
    degree: union(degreeDecoder, nil),
    degreeYear: union(number, nil),
    memberships: array(string),
});
type UserWithName = decodeType<typeof userWithNameDecoder>;

const userDecoder = record({
    email: string,
    alternateEmail: union(string, nil),
    degree: union(degreeDecoder, nil),
    degreeYear: union(number, nil),
    memberships: array(string),
});
type User = decodeType<typeof userDecoder>;

const UserAPI = {
    getUser: async (): Promise<UserWithName | null | ErrorMessage> => {
        try {
            const { data, status } = await axios.get('/api/user', {
                validateStatus: (statusCode: number) => {
                    return statusCode < 500;
                },
            });

            if (status === 404) {
                return null;
            }

            return userWithNameDecoder(data);
        } catch (error) {
            console.log(error); // eslint-disable-line

            return {
                message: 'Fail @ getUser',
            };
        }
    },

    putUser: async (user: User): Promise<{ status: number; response: string } | ErrorMessage> => {
        try {
            const { data, status } = await axios.put('/api/user', user, {
                headers: { 'Content-Type': 'application/json' },
                validateStatus: (statusCode) => statusCode < 500,
            });

            return { status: number(status), response: string(data) };
        } catch (error) {
            console.log(error); // eslint-disable-line

            return {
                status: 500,
                message: 'Det har skjedd en feil. Du kan prøve å logge inn og ut, og sende inn skjemaet på nytt.',
            };
        }
    },
};

export {
    UserAPI,
    userDecoder,
    userWithNameDecoder,
    type FormValues as ProfileFormValues,
    type User,
    type UserWithName,
};
