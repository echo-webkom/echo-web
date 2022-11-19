import axios from 'axios';
import type { decodeType } from 'typescript-json-decoder';
import { string, record, union, nil, number, array } from 'typescript-json-decoder';
import type { ErrorMessage } from '@utils/error';
import type { Degree } from '@utils/decoders';
import { degreeDecoder } from '@utils/decoders';

// Values directly from the form (aka form fields)
interface FormValues {
    alternateEmail: string | null;
    degree: Degree | null;
    degreeYear: number | null;
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
    getUser: async (email: string, name: string, idToken: string): Promise<User | null | ErrorMessage> => {
        try {
            const { data, status } = await axios.get(`${BACKEND_URL}/user`, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
                validateStatus: (statusCode: number) => statusCode < 500,
            });

            // no user in database
            if (status === 404) {
                return {
                    email: email,
                    name: name,
                    alternateEmail: null,
                    degreeYear: null,
                    degree: null,
                    memberships: [],
                };
            }

            const user = userDecoder(data);

            return { ...user, name, email };
        } catch (error) {
            console.log(error); // eslint-disable-line

            return {
                message: JSON.stringify(error),
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

    putUser: async (user: User, idToken: string): Promise<{ status: number; response: string } | ErrorMessage> => {
        try {
            const { data, status } = await axios.put(
                `${BACKEND_URL}/user`,
                { ...user, memberships: [] },
                {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                        'Content-Type': 'application/json',
                    },
                    validateStatus: (statusCode: number) => statusCode < 500,
                },
            );

            return { status, response: string(data) };
        } catch (error) {
            console.log(error); // eslint-disable-line

            return {
                status: 500,
                message: 'Du kan prøve å logge inn og ut, og sende inn skjemaet på nytt.',
            };
        }
    },

    getUsers: async (idToken: string): Promise<Array<User> | ErrorMessage> => {
        try {
            const { data, status } = await axios.get(`${BACKEND_URL}/users`, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
                validateStatus: (statusCode: number) => statusCode < 500,
            });

            if (status === 200) {
                return array(userDecoder)(data);
            }

            return {
                message: 'Du har ikke tilgang til denne siden :(',
            };
        } catch (error) {
            return {
                message: JSON.stringify(error),
            };
        }
    },
};

const userIsComplete = (user: User | null): user is User =>
    typeof user?.email === 'string' &&
    typeof user.name === 'string' &&
    typeof user.degree === 'string' &&
    typeof user.degreeYear === 'number';

export { UserAPI, userDecoder, type FormValues as ProfileFormValues, type User, userIsComplete };
