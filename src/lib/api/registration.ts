import { Pojo, array, boolean, record, string, number, decodeType, union, nil } from 'typescript-json-decoder';
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
});

export type Response = decodeType<typeof responseDecoder>;
const responseDecoder = record({
    code: string,
    msg: string,
    date: union(string, nil),
});

const registrationListDecoder = array(registrationDecoder);

const decodeError: Response = {
    code: 'decode-error',
    msg: 'Det har skjedd en feil.',
    date: null,
};

export const RegistrationAPI = {
    getRegistrations: async (
        auth: string,
        slug: string,
        backendHost: string,
    ): Promise<{ registrations: Array<Registration> | null; errorReg: string | null }> => {
        try {
            const { data } = await axios.get(`http://${backendHost}/registration?slug=${slug}`, {
                headers: { Authorization: auth },
            });

            return {
                registrations: registrationListDecoder(data),
                errorReg: null,
            };
        } catch (error) {
            return {
                registrations: null,
                errorReg: error,
            };
        }
    },

    submitRegistration: async (
        registration: Registration,
        backendHost: string,
    ): Promise<{ response: Response; statusCode: number }> => {
        try {
            const { data, status } = await axios.post(`http://${backendHost}/registration`, registration, {
                headers: { 'Content-Type': 'application/json' },
                validateStatus: (statusCode: number) => {
                    return statusCode < 500;
                },
            });

            return {
                response: responseDecoder(data) || decodeError,
                statusCode: status,
            };
        } catch (err) {
            if (err.response) {
                return {
                    response: {
                        code: 'internal-server-error',
                        msg: 'Det har skjedd en feil.',
                        date: null,
                    },
                    statusCode: err.reponse.status,
                };
            }
            if (err.request) {
                return {
                    response: {
                        code: 'no-response-error',
                        msg: 'Det har skjedd en feil.',
                        date: null,
                    },
                    statusCode: 500,
                };
            }

            return {
                response: {
                    code: 'request-error',
                    msg: 'Det har skjedd en feil.',
                    date: null,
                },
                statusCode: 500,
            };
        }
    },
};
