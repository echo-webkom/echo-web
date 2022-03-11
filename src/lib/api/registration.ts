import axios from 'axios';
import { array } from 'typescript-json-decoder';
import { responseDecoder, registrationDecoder } from './decoders';
import { ErrorMessage, Degree, Answer, Response, Registration } from './types';
import { HappeningType } from '.';

const genericError: { title: string; desc: string; date: string | undefined } = {
    title: 'Det har skjedd en feil.',
    desc: 'Vennligst prøv igjen',
    date: undefined,
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

const registrationRoute = 'registration';

const RegistrationAPI = {
    submitRegistration: async (
        registration: FormRegistration,
        backendUrl: string,
    ): Promise<{ response: Response; statusCode: number }> => {
        try {
            const { data, status } = await axios.post(`${backendUrl}/${registrationRoute}`, registration, {
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
            const { data } = await axios.get(`${backendUrl}/${registrationRoute}/${link}?json=y`);

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

    deleteRegistration: async (
        link: string,
        email: string,
        backendUrl: string,
    ): Promise<{ response: string | null; error: string | null }> => {
        try {
            const { data } = await axios.delete(
                `${backendUrl}/${registrationRoute}/${link}/${encodeURIComponent(email)}`,
            );

            return { response: data, error: null };
        } catch (error) {
            console.log(error); // eslint-disable-line
            return { response: null, error: JSON.stringify(error) };
        }
    },
};

export { RegistrationAPI, registrationRoute };
export type { FormValues };
