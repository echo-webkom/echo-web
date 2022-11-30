import axios from 'axios';
import type { decodeType } from 'typescript-json-decoder';
import { array, record, string, number, boolean, optional, union, nil } from 'typescript-json-decoder';
import type { HappeningType } from '@api/happening';
import { degreeDecoder, emptyArrayOnNilDecoder } from '@utils/decoders';
import { isErrorMessage } from '@utils/error';
import type { ErrorMessage } from '@utils/error';

const responseDecoder = record({
    code: string,
    title: string,
    desc: string,
    date: optional(union(string, nil)),
});
type Response = decodeType<typeof responseDecoder>;

const answerDecoder = record({
    question: string,
    answer: string,
});
type Answer = decodeType<typeof answerDecoder>;

const registrationDecoder = record({
    email: string,
    alternateEmail: union(string, nil),
    name: string,
    degree: degreeDecoder,
    degreeYear: number,
    slug: string,
    submitDate: string,
    waitList: boolean,
    answers: array(answerDecoder),
    memberships: (value) => emptyArrayOnNilDecoder(string, value),
});
type Registration = decodeType<typeof registrationDecoder>;

const registrationCountDecoder = record({
    slug: string,
    count: number,
    waitListCount: number,
});
type RegistrationCount = decodeType<typeof registrationCountDecoder>;

const genericError = {
    title: 'Det har skjedd en feil.',
    desc: 'Vennligst prøv igjen',
    date: null,
};

// Values directly from the form (aka form fields)
interface FormValues {
    email: string;
    answers: Array<string>;
}

// The data from the form + slug and type
interface FormRegistration {
    email: string;
    slug: string;
    type: HappeningType;
    answers: Array<Answer>;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';

const RegistrationAPI = {
    submitRegistration: async (
        registration: FormRegistration,
        idToken: string,
    ): Promise<{ response: Response; statusCode: number }> => {
        try {
            const { data, status } = await axios.post(`${BACKEND_URL}/registration`, registration, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
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

    getRegistrations: async (slug: string, idToken: string): Promise<Array<Registration> | ErrorMessage> => {
        try {
            const { data } = await axios.get(`${BACKEND_URL}/registration/${slug}?json=y`, {
                headers: { Authorization: `Bearer ${idToken}` },
            });

            if (isErrorMessage(data)) {
                return data;
            }

            return array(registrationDecoder)(data);
        } catch {
            return {
                message: 'Fail @ getRegistrations',
            };
        }
    },

    deleteRegistration: async (
        slug: string,
        email: string,
        idToken: string,
    ): Promise<{ response: string | null; error: string | null }> => {
        try {
            const { data } = await axios.delete(`${BACKEND_URL}/registration/${slug}/${email}`, {
                headers: { Authorization: `Bearer ${idToken}` },
            });

            return { response: string(data), error: null };
        } catch (error) {
            console.log(error); // eslint-disable-line
            return { response: null, error: JSON.stringify(error) };
        }
    },

    getRegistrationCountForSlugs: async (slugs: Array<string>): Promise<Array<RegistrationCount> | ErrorMessage> => {
        try {
            const { data } = await axios.post(`${BACKEND_URL}/registration/count`, { slugs });
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

    isUserRegistered: async (slug: string, backendUrl: string, email: string): Promise<boolean | ErrorMessage> => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/${registrationRoute}/isRegistered?slug=${slug}&email=${email}`,
            );

            if (isErrorMessage(data)) {
                return data;
            }

            return data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (!error.response) {
                    return { message: '404' };
                }
                return {
                    message: error.response.status === 404 ? '404' : 'Fail @ getUserRegistration',
                };
            }

            return {
                message: 'Fail @ getUserRegistration',
            };
        }
    },
};

export {
    RegistrationAPI,
    registrationDecoder,
    type FormValues as RegFormValues,
    type RegistrationCount,
    type Registration,
};
