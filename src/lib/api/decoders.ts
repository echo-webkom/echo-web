import { record, string } from 'typescript-json-decoder';

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

export { authorDecoder, publishedAtDecoder };
