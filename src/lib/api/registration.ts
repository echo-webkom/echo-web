import axios from 'axios';
import { array } from 'typescript-json-decoder';
import handleError from './errors';
import { responseDecoder, registrationDecoder, spotRangeCountDecoder } from './decoders';
import { Degree, Answer, Response, Registration, SpotRangeCount } from './types';
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

    getRegistrations: async (
        link: string,
        backendUrl: string,
    ): Promise<{ registrations: Array<Registration> | null; error: string | null }> => {
        try {
            const { data } = await axios.get(`${backendUrl}/${registrationRoute}/${link}?json=y`);

            return {
                registrations: array(registrationDecoder)(data),
                error: null,
            };
        } catch (error) {
            console.log(error); // eslint-disable-line
            if (axios.isAxiosError(error)) {
                if (!error.response) {
                    return {
                        registrations: null,
                        error: '404',
                    };
                }
                return {
                    registrations: null,
                    error: error.response.status === 404 ? '404' : handleError(error.response.status),
                };
            }

            return {
                registrations: null,
                error: handleError(500),
            };
        }
    },

    getSpotRangeCounts: async (
        auth: string,
        slug: string,
        type: HappeningType,
        backendUrl: string,
    ): Promise<{ spotRangeCounts: Array<SpotRangeCount> | null; spotRangeCountsErr: string | null }> => {
        try {
            const { data } = await axios.get(`${backendUrl}/${registrationRoute}?slug=${slug}&type=${type}`, {
                auth: {
                    username: 'admin',
                    password: auth,
                },
            });

            return {
                spotRangeCounts: array(spotRangeCountDecoder)(data),
                spotRangeCountsErr: null,
            };
        } catch (error) {
            console.log(error); // eslint-disable-line
            return {
                spotRangeCounts: null,
                spotRangeCountsErr: JSON.stringify(error),
            };
        }
    },
};

export { RegistrationAPI, registrationRoute };
export type { FormValues };
