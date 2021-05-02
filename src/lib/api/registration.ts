import { Pojo, array, boolean, record, string, number, decodeType } from 'typescript-json-decoder';
import axios from 'axios';

export enum Degree {
    DTEK = 'DTEK',
    DSIK = 'DSIK',
    DVIT = 'DVIT',
    BINF = 'BINF',
    IMØ = 'IMØ',
    IKT = 'IKT',
    KOGNI = 'KOGNI',
    INF = 'INF',
    PROG = 'PROG',
    ÅRMNINF = 'ÅRMNINF',
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
        case 'IMØ':
            return Degree.IMØ;
        case 'IKT':
            return Degree.IKT;
        case 'KOGNI':
            return Degree.KOGNI;
        case 'INF':
            return Degree.INF;
        case 'PROG':
            return Degree.PROG;
        case 'ÅRMINF':
            return Degree.ÅRMNINF;
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

const registrationListDecoder = array(registrationDecoder);

export const RegistrationAPI = {
    getRegistrations: async (
        auth: string,
        slug: string,
    ): Promise<{ registrations: Array<Registration> | null; errorReg: string | null }> => {
        try {
            const { data } = await axios.get(`https://${process.env.BACKEND_HOST}/registration?slug=${slug}`, {
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
};
