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
} from 'typescript-json-decoder';

type SpotRange = decodeType<typeof spotRangeDecoder>;
const spotRangeDecoder = record({
    spots: number,
    minDegreeYear: number,
    maxDegreeYear: number,
});

type Question = decodeType<typeof questionDecoder>;
const questionDecoder = record({
    questionText: string,
    inputType: union(literal('radio'), literal('textbox')),
    alternatives: union(nil, array(string)),
});

type Slug = decodeType<typeof slugDecoder>;
const slugDecoder = record({
    slug: string,
});

const emptyArrayOnNilDecoder = <T>(decoder: DecoderFunction<T>, value: Pojo): Array<decodeType<T>> =>
    union(array(decoder), nil)(value) ?? [];

export { emptyArrayOnNilDecoder, slugDecoder, spotRangeDecoder, questionDecoder };
export type { Slug, SpotRange, Question };
