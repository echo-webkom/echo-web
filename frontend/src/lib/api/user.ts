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
            const response = await fetch(`${BACKEND_URL}/user`, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });

            // no user in database
            if (response.status === 404) {
                return {
                    email: email,
                    name: name,
                    alternateEmail: null,
                    degreeYear: null,
                    degree: null,
                    memberships: [],
                };
            }

            if (response.status === 401) {
                return { message: '401' };
            }

            const data = await response.json();

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
            const response = await fetch(`${BACKEND_URL}/user`, {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    name,
                }),
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                },
            });

            return {
                status: response.status,
                response: `User created with email = ${email} and name = ${name}`,
            };
        } catch (error) {
            console.log(error); // eslint-disable-line

            return {
                message: JSON.stringify(error),
            };
        }
    },

    putUser: async (user: User, idToken: string): Promise<User | ErrorMessage> => {
        try {
            const response = await fetch(`${BACKEND_URL}/user`, {
                method: 'PUT',

                body: JSON.stringify({ ...user, memberships: [] }),
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.status === 200) {
                return userDecoder(data);
            }

            return {
                message: string(data),
            };
        } catch (error) {
            console.log(error); // eslint-disable-line

            return {
                message: error as string,
            };
        }
    },

    getUsers: async (idToken: string): Promise<Array<User> | ErrorMessage> => {
        try {
            const response = await fetch(`${BACKEND_URL}/users`, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });

            const data = await response.json();

            if (response.status === 200) {
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
