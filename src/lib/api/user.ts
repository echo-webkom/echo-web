import axios from 'axios';
import { User, ErrorMessage } from './types';
import { userDecoder } from './decoders';

const userRoute = 'user';
const UserAPI = {
    getUser: async (): Promise<User | ErrorMessage> => {
        try {
            const { data, status } = await axios.get(`/api/${userRoute}`, {
                validateStatus: (statusCode: number) => {
                    return statusCode < 500;
                },
            });

            if (status === 404) {
                // No user in database
            }

            return userDecoder(data);
        } catch (error) {
            console.log(error); // eslint-disable-line
            if (axios.isAxiosError(error)) {
                if (!error.response) {
                    return { message: '404' };
                }
                return {
                    message: error.response.status === 404 ? '404' : 'Fail @ getUser',
                };
            }

            return {
                message: 'Fail @ getUser',
            };
        }
    },
};
/* eslint-disable import/prefer-default-export */
export { UserAPI };
