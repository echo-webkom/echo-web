import type { decodeType, DecoderFunction } from 'typescript-json-decoder';
import { array, literal, nil, record, string, union } from 'typescript-json-decoder';

const slugDecoder = record({
    slug: string,
});
type Slug = decodeType<typeof slugDecoder>;

const emptyArrayOnNilDecoder = <T>(decoder: DecoderFunction<T>, value: unknown): Array<decodeType<T>> =>
    union(array(decoder), nil)(value) ?? [];

const degreeDecoder = union(
    literal('DTEK'),
    literal('DSIK'),
    literal('DVIT'),
    literal('BINF'),
    literal('IMO'),
    // IKT and KOGNI should not be used,
    // are only here for backwards compatibility.
    literal('IKT'),
    literal('KOGNI'),
    //
    literal('INF'),
    literal('PROG'),
    literal('ARMINF'),
    literal('POST'),
    literal('MISC'),
);
type Degree = decodeType<typeof degreeDecoder>;

export { emptyArrayOnNilDecoder, slugDecoder, degreeDecoder, type Degree, type Slug };
