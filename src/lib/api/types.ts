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
    postDecoder,
    minuteDecoder,
    jobAdvertDecoder,
    happeningDecoder,
} from './decoders';

type SpotRange = decodeType<typeof spotRangeDecoder>;

type Question = decodeType<typeof questionDecoder>;

type Slug = decodeType<typeof slugDecoder>;

type Profile = decodeType<typeof profileDecoder>;

type Member = decodeType<typeof memberDecoder>;

type StudentGroup = decodeType<typeof studentGroupDecoder>;

type Answer = decodeType<typeof answerDecoder>;

type Registration = decodeType<typeof registrationDecoder>;

type Response = decodeType<typeof responseDecoder>;

type SpotRangeCount = decodeType<typeof spotRangeCountDecoder>;

type Post = decodeType<typeof postDecoder>;

type Minute = decodeType<typeof minuteDecoder>;

type JobAdvert = decodeType<typeof jobAdvertDecoder>;

type Happening = decodeType<typeof happeningDecoder>;

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
    IKT = 'IKT',
    KOGNI = 'KOGNI',
    INF = 'INF',
    PROG = 'PROG',
    ARMNINF = 'ARMNINF',
    POST = 'POST',
    MISC = 'MISC',
}

export type {
    Slug,
    SpotRange,
    Question,
    Profile,
    Member,
    StudentGroup,
    Answer,
    Registration,
    Response,
    SpotRangeCount,
    Post,
    Minute,
    JobAdvert,
    Happening,
};

export { HappeningType, Degree };
