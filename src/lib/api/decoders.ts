import { record, string } from 'typescript-json-decoder';

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
