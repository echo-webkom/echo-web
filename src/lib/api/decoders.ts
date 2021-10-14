import { array, decodeType, literal, nil, record, string, union, number } from 'typescript-json-decoder';

// Common decoders that are used with multiple content types.

const authorDecoder = record({
    author: record({
        name: string,
    }),
});

const publishedAtDecoder = record({
    sys: record({
        firstPublishedAt: string,
    }),
});

const slugDecoder = record({
    slug: record({
        current: string,
    }),
});

const spotRangeDecoder = record({
    minDegreeYear: number,
    maxDegreeYear: number,
    spots: number,
});

type Question = decodeType<typeof questionDecoder>;
const questionDecoder = record({
    questionText: string,
    inputType: union(literal('radio'), literal('textbox')),
    alternatives: union(nil, array(string)),
});

export { authorDecoder, publishedAtDecoder, slugDecoder, spotRangeDecoder, questionDecoder };
export type { Question };
