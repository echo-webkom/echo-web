import axios from 'axios';
import { array, boolean, decodeType, number, optional, Pojo, record, string } from 'typescript-json-decoder';
import { HappeningType } from '.';

enum Degree {
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

type Answer = decodeType<typeof answerDecoder>;
const answerDecoder = record({
    question: string,
    answer: string,
});

type Registration = decodeType<typeof registrationDecoder>;
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

type Response = decodeType<typeof responseDecoder>;
const responseDecoder = record({
    code: string,
    title: string,
    desc: string,
    date: optional(string),
});

type SpotRangeCount = decodeType<typeof spotRangeCountDecoder>;
const spotRangeCountDecoder = record({
    spots: number,
    minDegreeYear: number,
    maxDegreeYear: number,
    regCount: number,
    waitListCount: number,
});

const genericError: { title: string; desc: string; date: string | undefined } = {
    title: 'Det har skjedd en feil.',
    desc: 'Vennligst prøv igjen',
    date: undefined,
};

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

const RegistrationAPI = {
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
            if (axios.isAxiosError(err)) {
                if (err.response) {
                    return {
                        response: { ...genericError, code: 'InternalServerError' },
                        statusCode: err.response.status,
                    };
                }
                if (err.request) {
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

    getSpotRangeCounts: async (
        auth: string,
        slug: string,
        type: HappeningType,
        backendUrl: string,
    ): Promise<{ spotRangeCounts: Array<SpotRangeCount> | null; spotRangeCountsErr: string | null }> => {
        try {
            const { data } = await axios.get(`${backendUrl}/registration?slug=${slug}&type=${type}`, {
                auth: {
                    username: 'admin',
                    password: auth,
                },
            });

            return {
                spotRangeCounts: array(spotRangeCountDecoder)(data),
                spotRangeCountsErr: null,
            };
        } catch (err) {
            console.log(err); // eslint-disable-line
            return {
                spotRangeCounts: null,
                spotRangeCountsErr: JSON.stringify(err),
            };
        }
    },
};

export { Degree, RegistrationAPI };
export type { Answer, Registration, Response, SpotRangeCount };
