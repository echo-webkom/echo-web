import axios from 'axios';
import { number, string } from 'typescript-json-decoder';
import { Degree, User, UserWithName, ErrorMessage } from './types';
import { userWithNameDecoder } from './decoders';

// Values directly from the form (aka form fields)
interface FormValues {
    alternateEmail: string;
    degree: Degree;
    degreeYear: number;
}

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
/* eslint-disable import/prefer-default-export */
export { UserAPI };
export type { FormValues };
