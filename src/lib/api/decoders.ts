import { array, decodeType, literal, nil, record, string, union } from 'typescript-json-decoder';

// Common decoders that are used with multiple content types.

const authorDecoder = record({
    author: record({
        authorName: string,
    }),
});

const publishedAtDecoder = record({
    sys: record({
        firstPublishedAt: string,
    }),
});

type Question = decodeType<typeof questionDecoder>;
const questionDecoder = record({
    questionText: string,
    inputType: union(literal('radio'), literal('textbox')),
    alternatives: union(nil, array(string)),
});

export { authorDecoder, publishedAtDecoder, questionDecoder };
export type { Question };
