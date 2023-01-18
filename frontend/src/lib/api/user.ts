import { z } from 'zod';
import { parseISO } from 'date-fns';
import type { ErrorMessage } from '@utils/error';
import type { Degree } from '@utils/schemas';
import { degreeSchema } from '@utils/schemas';

// Values directly from the form (aka form fields)
interface FormValues {
    alternateEmail: string | null;
    degree: Degree | null;
    degreeYear: number | null;
}

const userSchema = z.object({
    email: z.string(),
    alternateEmail: z.string().nullable(),
    name: z.string(),
    degree: degreeSchema.nullable(),
    degreeYear: z.number().nullable(),
    memberships: z.array(z.string()),
    createdAt: z.string().transform((date) => parseISO(date)),
    modifiedAt: z.string().transform((date) => parseISO(date)),
});
type User = z.infer<typeof userSchema>;

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
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                };
            }

            if (response.status === 401) {
                return { message: '401' };
            }

            const data = await response.json();

            const user = userSchema.parse(data);

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
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                }),
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                return {
                    status: response.status,
                    response: `User created with email = ${email} and name = ${name}`,
                };
            } else if (response.status === 409) {
                return {
                    status: response.status,
                    response: `User with email = ${email} already exists`,
                };
            }

            return {
                message: `Error creating user with email = ${email} and name = ${name}`,
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

            if (response.status === 200) {
                const data = await response.json();
                return userSchema.parse(data);
            } else {
                const data = await response.text();

                return {
                    message: data,
                };
            }
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
                return userSchema.array().parse(data);
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

    getTestToken: async (email: string): Promise<string | ErrorMessage> => {
        try {
            const response = await fetch(`${BACKEND_URL}/token/${email}`);

            const token = await response.text();

            return response.status === 200 ? token : { message: response.statusText };
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

export { UserAPI, userSchema, type FormValues as ProfileFormValues, type User, userIsComplete };
