import { Pojo, array, optional, boolean, record, string, number, decodeType } from 'typescript-json-decoder';
import axios from 'axios';

export enum Degree {
    DTEK = 'DTEK',
    DSIK = 'DSIK',
    DVIT = 'DVIT',
    BINF = 'BINF',
    IMO = 'IMO',
    IKT = 'IKT',
    KOGNI = 'KOGNI',
    INF = 'INF',
    PROG = 'PROG',
    ARMNINF = 'ARMNINF',
    POST = 'POST',
    MISC = 'MISC',
}

const degreeDecoder = (value: Pojo): Degree => {
    const str: string = string(value);

    switch (str) {
        case 'DTEK':
            return Degree.DTEK;
        case 'DSIK':
            return Degree.DSIK;
        case 'DVIT':
            return Degree.DVIT;
        case 'BINF':
            return Degree.BINF;
        case 'IMO':
            return Degree.IMO;
        case 'IKT':
            return Degree.IKT;
        case 'KOGNI':
            return Degree.KOGNI;
        case 'INF':
            return Degree.INF;
        case 'PROG':
            return Degree.PROG;
        case 'ARMINF':
            return Degree.ARMNINF;
        case 'POST':
            return Degree.POST;
        default:
            return Degree.MISC;
    }
};

export type Answer = decodeType<typeof answerDecoder>;
const answerDecoder = record({
    question: string,
    answer: string,
});

export type Registration = decodeType<typeof registrationDecoder>;
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

export type Response = decodeType<typeof responseDecoder>;
const responseDecoder = record({
    code: string,
    title: string,
    desc: string,
    date: optional(string),
});

const registrationListDecoder = array(registrationDecoder);

const genericError: { title: string; desc: string; date: string | undefined } = {
    title: 'Det har skjedd en feil.',
    desc: 'Vennligst prøv igjen',
    date: undefined,
};

// The data from the form + slug
interface FormRegistration {
    email: string;
    firstName: string;
    lastName: string;
    degree: Degree;
    degreeYear: number;
    slug: string;
    terms: boolean;
    answers: Array<Answer>;
}

export const RegistrationAPI = {
    getRegistrations: async (
        auth: string,
        slug: string,
        backendUrl: string,
    ): Promise<{ registrations: Array<Registration> | null; errorReg: string | null }> => {
        try {
            const { data } = await axios.get(`${backendUrl}/registration?slug=${slug}`, {
                auth: {
                    username: 'bedkom',
                    password: auth,
                },
            });

            return {
                registrations: registrationListDecoder(data),
                errorReg: null,
            };
        } catch (error) {
            console.log(error); // eslint-disable-line
            return {
                registrations: null,
                errorReg: error,
            };
        }
    },

    submitRegistration: async (
        registration: FormRegistration,
        backendUrl: string,
    ): Promise<{ response: Response; statusCode: number }> => {
        try {
            const { data, status } = await axios.post(`${backendUrl}/registration`, registration, {
                headers: { 'Content-Type': 'application/json' },
                validateStatus: (statusCode: number) => {
                    return statusCode < 500;
                },
            });

            return {
                response: responseDecoder(data) || { ...genericError, code: 'DecodeError' },
                statusCode: status,
            };
        } catch (err) {
            console.log(err); // eslint-disable-line
            if (err.response) {
                return {
                    response: { ...genericError, code: 'InternalServerError' },
                    statusCode: err.reponse.status,
                };
            }
            if (err.request) {
                return {
                    response: { ...genericError, code: 'NoResponseError' },
                    statusCode: 500,
                };
            }

            return {
                response: { ...genericError, code: 'RequestError' },
                statusCode: 500,
            };
        }
    },
};
