import {
    array,
    decodeType,
    DecoderFunction,
    literal,
    nil,
    number,
    Pojo,
    record,
    string,
    union,
    optional,
    boolean,
} from 'typescript-json-decoder';
import { Degree, HappeningType } from './types';

const spotRangeDecoder = record({
    spots: number,
    minDegreeYear: number,
    maxDegreeYear: number,
});

const questionDecoder = record({
    questionText: string,
    inputType: union(literal('radio'), literal('textbox')),
    alternatives: union(nil, array(string)),
});

const slugDecoder = record({
    slug: string,
});

const emptyArrayOnNilDecoder = <T>(decoder: DecoderFunction<T>, value: Pojo): Array<decodeType<T>> =>
    union(array(decoder), nil)(value) ?? [];

const profileDecoder = record({
    name: string,
    imageUrl: union(string, nil),
});

const memberDecoder = record({
    role: string,
    profile: profileDecoder,
});

const studentGroupDecoder = record({
    name: string,
    slug: string,
    info: string,
    members: (value) => emptyArrayOnNilDecoder(memberDecoder, value),
});

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

const answerDecoder = record({
    question: string,
    answer: string,
});

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

const responseDecoder = record({
    code: string,
    title: string,
    desc: string,
    date: optional(union(string, nil)),
});

const spotRangeCountDecoder = record({
    spots: number,
    minDegreeYear: number,
    maxDegreeYear: number,
    regCount: number,
    waitListCount: number,
});

const happeningInfoDecoder = record({
    spotRanges: array(spotRangeCountDecoder),
    regVerifyToken: (value) => (value === undefined ? null : string(value)),
});

const postDecoder = record({
    title: string,
    body: string,
    slug: string,
    author: (value) => record({ name: string })(value).name,
    _createdAt: string,
});

const minuteDecoder = record({
    date: string,
    allmote: boolean,
    title: string,
    document: (value) => record({ asset: record({ url: string }) })(value).asset.url,
});

const jobAdvertDecoder = record({
    slug: string,
    body: string,
    companyName: string,
    title: string,
    logoUrl: string,
    deadline: string,
    locations: array(string),
    advertLink: string,
    jobType: union(literal('fulltime'), literal('parttime'), literal('internship'), literal('summerjob')),
    degreeYears: array(number),
    _createdAt: string,
});

const happeningTypeDecoder = (value: Pojo): HappeningType => {
    const str: string = string(value);

    switch (str) {
        case 'BEDPRES':
            return HappeningType.BEDPRES;
        default:
            return HappeningType.EVENT;
    }
};

const happeningDecoder = record({
    _createdAt: string,
    author: string,
    title: string,
    slug: string,
    date: string,
    body: string,
    location: string,
    locationLink: union(string, nil),
    companyLink: union(string, nil),
    registrationDate: union(string, nil),
    logoUrl: union(string, nil),
    contactEmail: union(string, nil),
    additionalQuestions: (value) => emptyArrayOnNilDecoder(questionDecoder, value),
    spotRanges: (value) => emptyArrayOnNilDecoder(spotRangeDecoder, value),
    happeningType: (value) => {
        if (value === 'BEDPRES' || value === 'bedpres') return HappeningType.BEDPRES;
        else if (value === 'EVENT' || value === 'event') return HappeningType.EVENT;
        else throw new Error(`Could not decode value '${JSON.stringify(value)}' to a HappeningType`);
    },
});

const bannerDecoder = record({
    color: string,
    text: string,
    linkTo: union(string, nil),
    isExternal: boolean,
});

const userDecoder = record({
    email: string,
    name: string,
    grade: union(number, nil),
    degree: union(degreeDecoder, nil),
});

export {
    emptyArrayOnNilDecoder,
    slugDecoder,
    spotRangeDecoder,
    questionDecoder,
    profileDecoder,
    memberDecoder,
    studentGroupDecoder,
    degreeDecoder,
    answerDecoder,
    registrationDecoder,
    responseDecoder,
    spotRangeCountDecoder,
    happeningInfoDecoder,
    postDecoder,
    minuteDecoder,
    jobAdvertDecoder,
    happeningDecoder,
    happeningTypeDecoder,
    bannerDecoder,
    userDecoder,
};
