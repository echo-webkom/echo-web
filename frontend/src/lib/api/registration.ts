import axios from 'axios';
import type { decodeType } from 'typescript-json-decoder';
import { array, record, string, number, boolean, optional, union, nil } from 'typescript-json-decoder';
import type { HappeningType } from '@api/happening';
import { type Degree, degreeDecoder } from '@utils/decoders';
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
    firstName: string,
    lastName: string,
    degree: degreeDecoder,
    degreeYear: number,
    slug: string,
    terms: boolean,
    submitDate: string,
    waitList: boolean,
    answers: array(answerDecoder),
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
    firstName: string;
    lastName: string;
    degree: Degree;
    degreeYear: number;
    terms1: boolean;
    terms2: boolean;
    terms3: boolean;
    answers: Array<string>;
}

// The data from the form + slug and type
interface FormRegistration {
    email: string;
    firstName: string;
    lastName: string;
    degree: Degree;
    degreeYear: number;
    slug: string;
    type: HappeningType;
    terms: boolean;
    answers: Array<Answer>;
    regVerifyToken: string | null;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';

const RegistrationAPI = {
    submitRegistration: async (registration: FormRegistration): Promise<{ resp: Response; status: number }> => {
        try {
            const { data, status } = await axios.post(`${BACKEND_URL}/registration`, registration, {
                headers: { 'Content-Type': 'application/json' },
                validateStatus: (statusCode: number) => {
                    return statusCode < 500;
                },
            });

            return {
                resp: responseDecoder(data),
                status,
            };
        } catch (error) {
            console.log(error); // eslint-disable-line
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    return {
                        resp: { ...genericError, code: 'InternalServerError' },
                        status: error.response.status,
                    };
                }
                if (error.request) {
                    return {
                        resp: { ...genericError, code: 'NoResponseError' },
                        status: 500,
                    };
                }
            }

            return {
                resp: { ...genericError, code: 'RequestError' },
                status: 500,
            };
        }
    },

    getRegistrations: async (slug: string): Promise<Array<Registration> | ErrorMessage> => {
        try {
            const { data } = await axios.get(`/api/registration?slug=${slug}`);

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
    ): Promise<{ response: string | null; error: string | null }> => {
        try {
            const { data } = await axios.delete(`/api/registration?slug=${slug}&email=${email}`);

            return { response: data, error: null };
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
};

export {
    RegistrationAPI,
    registrationDecoder,
    type FormValues as RegFormValues,
    type RegistrationCount,
    type Registration,
};
