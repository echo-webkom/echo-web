import { decodeType } from 'typescript-json-decoder';
import {
    slugDecoder,
    spotRangeDecoder,
    questionDecoder,
    profileDecoder,
    memberDecoder,
    studentGroupDecoder,
    answerDecoder,
    registrationDecoder,
    responseDecoder,
    spotRangeCountDecoder,
    happeningInfoDecoder,
    postDecoder,
    minuteDecoder,
    jobAdvertDecoder,
    happeningDecoder,
    bannerDecoder,
    registrationCountDecoder,
    userDecoder,
    userWithNameDecoder,
} from './decoders';

type SpotRange = decodeType<typeof spotRangeDecoder>;

type Question = decodeType<typeof questionDecoder>;

type Slug = decodeType<typeof slugDecoder>;

type Profile = decodeType<typeof profileDecoder>;

type Member = decodeType<typeof memberDecoder>;

type StudentGroup = decodeType<typeof studentGroupDecoder>;

type Answer = decodeType<typeof answerDecoder>;

type Registration = decodeType<typeof registrationDecoder>;

type RegistrationCount = decodeType<typeof registrationCountDecoder>;

type Response = decodeType<typeof responseDecoder>;

type SpotRangeCount = decodeType<typeof spotRangeCountDecoder>;

type HappeningInfo = decodeType<typeof happeningInfoDecoder>;

type Post = decodeType<typeof postDecoder>;

type Minute = decodeType<typeof minuteDecoder>;

type JobAdvert = decodeType<typeof jobAdvertDecoder>;

type Happening = decodeType<typeof happeningDecoder>;

type Banner = decodeType<typeof bannerDecoder>;

type User = decodeType<typeof userDecoder>;

type UserWithName = decodeType<typeof userWithNameDecoder>;

enum HappeningType {
    BEDPRES = 'BEDPRES',
    EVENT = 'EVENT',
}

enum Degree {
    DTEK = 'DTEK',
    DSIK = 'DSIK',
    DVIT = 'DVIT',
    BINF = 'BINF',
    IMO = 'IMO',
    // IKT and KOGNI should not be used,
    // are only here for backwards compatibility.
    IKT = 'IKT',
    KOGNI = 'KOGNI',
    //
    INF = 'INF',
    PROG = 'PROG',
    ARMNINF = 'ARMNINF',
    POST = 'POST',
    MISC = 'MISC',
}

interface ErrorMessage {
    message: string;
}

const isErrorMessage = (object: any): object is ErrorMessage => {
    return 'message' in object;
};

export type {
    ErrorMessage,
    Slug,
    SpotRange,
    Question,
    Profile,
    Member,
    StudentGroup,
    Answer,
    Registration,
    RegistrationCount,
    Response,
    SpotRangeCount,
    HappeningInfo,
    Post,
    Minute,
    JobAdvert,
    Happening,
    Banner,
    User,
    UserWithName,
};

export { HappeningType, Degree, isErrorMessage };
