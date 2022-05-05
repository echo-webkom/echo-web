import axios from 'axios';
import { string } from 'typescript-json-decoder';
import { Degree, User, UserWithName, ErrorMessage } from './types';
import { userWithNameDecoder } from './decoders';

// Values directly from the form (aka form fields)
interface FormValues {
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

    putUser: async (user: User): Promise<string | ErrorMessage> => {
        try {
            const { data } = await axios.put('/api/user', user, { headers: { 'Content-Type': 'application/json' } });

            return string(data);
        } catch (error) {
            console.log(error); // eslint-disable-line

            return {
                message: 'Fail @ putUser',
            };
        }
    },
};
/* eslint-disable import/prefer-default-export */
export { UserAPI };
export type { FormValues };
