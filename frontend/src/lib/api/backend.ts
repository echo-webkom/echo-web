import axios from 'axios';
import { array, string } from 'typescript-json-decoder';
import {
    userDecoder,
    happeningInfoDecoder,
    responseDecoder,
    registrationDecoder,
    registrationCountDecoder,
} from './decoders';
import { User, HappeningInfo, ErrorMessage, Degree, Answer, Response, Registration, RegistrationCount } from './types';
import { HappeningType } from '.';

const genericError = {
    title: 'Det har skjedd en feil.',
    desc: 'Vennligst prøv igjen',
    date: null,
};

// Values directly from the profile form (aka form fields)
interface ProfileFormValues {
    degree: Degree;
    degreeYear: number;
}

// Values directly from the registration form (aka form fields)
interface RegFormValues {
    email: string;
    firstName: string;
    lastName: string;
    degree: Degree;
    degreeYear: number;
    terms1: boolean;
    terms2: boolean;
    terms3: boolean;
    answers: Array<string>;
}

// The data from the registration form + type and regVerifyToken
interface FormRegistration {
    email: string;
    firstName: string;
    lastName: string;
    degree: Degree;
    degreeYear: number;
    type: HappeningType;
    terms: boolean;
    answers: Array<Answer>;
    regVerifyToken: string | null;
}

const BackendAPI = {
    submitRegistration: async (
        registration: FormRegistration,
        slug: string,
        backendUrl: string,
    ): Promise<{ response: Response; statusCode: number }> => {
        try {
            const { data, status } = await axios.post(`${backendUrl}/happening/${slug}/registrations`, registration, {
                headers: { 'Content-Type': 'application/json' },
                validateStatus: (statusCode: number) => {
                    return statusCode < 500;
                },
            });

            return {
                response: responseDecoder(data),
                statusCode: status,
            };
        } catch (error) {
            console.log(error); // eslint-disable-line
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    return {
                        response: { ...genericError, code: 'InternalServerError' },
                        statusCode: error.response.status,
                    };
                }
                if (error.request) {
                    return {
                        response: { ...genericError, code: 'NoResponseError' },
                        statusCode: 500,
                    };
                }
            }

            return {
                response: { ...genericError, code: 'RequestError' },
                statusCode: 500,
            };
        }
    },

    getRegistrations: async (link: string, backendUrl: string): Promise<Array<Registration> | ErrorMessage> => {
        try {
            const { data } = await axios.get(`${backendUrl}/happening/${link}/registrations?json=y`);

            return array(registrationDecoder)(data);
        } catch (error) {
            console.log(error); // eslint-disable-line
            if (axios.isAxiosError(error)) {
                if (!error.response) {
                    return { message: '404' };
                }
                return {
                    message: error.response.status === 404 ? '404' : 'Fail @ getRegistrations',
                };
            }

            return {
                message: 'Fail @ getRegistrations',
            };
        }
    },

    getRegistrationCountForSlugs: async (
        slugs: Array<string>,
        backendUrl: string,
    ): Promise<Array<RegistrationCount> | ErrorMessage> => {
        try {
            const { data } = await axios.post(`${backendUrl}/happening/count/registrations`, { slugs });

            return array(registrationCountDecoder)(data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (!error.response) {
                    return { message: '404' };
                }
                return {
                    message: error.response.status === 404 ? '404' : 'Fail @ getRegistrationCountForSlugs',
                };
            }

            return {
                message: 'Fail @ getRegistrationCountForSlugs',
            };
        }
    },

    deleteRegistration: async (
        link: string,
        email: string,
        backendUrl: string,
    ): Promise<{ response: string | null; error: string | null }> => {
        try {
            const { data } = await axios.delete(
                `${backendUrl}/happening/${link}/registrations/${encodeURIComponent(email)}`,
            );

            return { response: data, error: null };
        } catch (error) {
            console.log(error); // eslint-disable-line
            return { response: null, error: JSON.stringify(error) };
        }
    },

    getHappeningInfo: async (auth: string, slug: string, backendUrl: string): Promise<HappeningInfo | ErrorMessage> => {
        try {
            const { data } = await axios.get(`${backendUrl}/happening/${slug}`, {
                auth: {
                    username: 'admin',
                    password: auth,
                },
            });

            return happeningInfoDecoder(data);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return { message: JSON.stringify(error) };
        }
    },

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

export { BackendAPI };
export type { RegFormValues, ProfileFormValues };
