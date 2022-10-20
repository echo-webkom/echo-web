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

const userDecoder = record({
    email: string,
    alternateEmail: union(string, nil),
    name: string,
    degree: union(degreeDecoder, nil),
    degreeYear: union(number, nil),
    memberships: array(string),
});
type User = decodeType<typeof userDecoder>;

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';

const UserAPI = {
    getUser: async (): Promise<User | null | ErrorMessage> => {
        try {
            const { data, status } = await axios.get('/api/user', {
                validateStatus: (statusCode: number) => {
                    return statusCode < 500;
                },
            });

            if (status === 404) {
                return null;
            }

            return userDecoder(data);
        } catch (error) {
            console.log(error); // eslint-disable-line

            return {
                message: 'Fail @ getUser',
            };
        }
    },

    postInitialUser: async (
        idToken: string,
        email: string,
        name: string,
    ): Promise<{ status: number; response: string } | ErrorMessage> => {
        try {
            const { status, data } = await axios.post(
                `${BACKEND_URL}/user`,
                { email, name },
                {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                    validateStatus: (status: number) => status < 500,
                },
            );

            return {
                status,
                response: data,
            };
        } catch (error) {
            console.log(error); // eslint-disable-line

            return {
                message: JSON.stringify(error),
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

    getUsers: async (): Promise<Array<User> | ErrorMessage> => {
        try {
            const { data, status }: { data: Array<User>; status: number } = await axios.get('/api/users', {
                headers: { 'Content-Type': 'application/json' },
                validateStatus: (statusCode: number) => statusCode < 500,
            });

            if (status === 200) {
                return data;
            }

            return {
                message: 'Du har ikke tilgang til denne siden :(',
            };
        } catch (error) {
            console.log(error); // eslint-disable-line

            return {
                message: 'Fail @ getUsers',
            };
        }
    },
};

export { UserAPI, userDecoder, type FormValues as ProfileFormValues, type User };
