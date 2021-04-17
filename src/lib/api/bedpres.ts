import { parseISO, isBefore } from 'date-fns';
import { Pojo, array, record, string, number, decodeType } from 'typescript-json-decoder';
import API from './api';
import { publishedAtDecoder, authorDecoder } from './decoders';
import { GET_N_BEDPRESES, GET_BEDPRES_BY_SLUG } from './schema';

export type Bedpres = decodeType<typeof bedpresDecoder>;
const bedpresDecoder = (value: Pojo) => {
    // Defines the structure of the JSON object we
    // are trying to decode, WITHOUT any fields
    // that are nested.
    //
    // For example, the field "author" is nested;
    //      author: { authorName: string }
    //
    // We need to define additional decoders
    // for these nested fields.
    const baseDecoder = record({
        title: string,
        slug: string,
        date: string,
        spots: number,
        body: string,
        location: string,
        companyLink: string,
        registrationTime: string,
    });

    // Decoders for the nested fields.
    const registrationLinksDecoder = record({
        registrationLinksCollection: record({
            items: array({
                link: string,
                description: string,
            }),
        }),
    });

    const logoUrlDecoder = record({
        logo: record({
            url: string,
        }),
    });

    // We combine the base decoder with the decoders
    // for the nested fields, and return the final JSON object.
    return {
        ...baseDecoder(value),
        logoUrl: logoUrlDecoder(value).logo.url,
        registrationLinks: isBefore(parseISO(baseDecoder(value).registrationTime), new Date())
            ? registrationLinksDecoder(value).registrationLinksCollection.items
            : null,
        publishedAt: publishedAtDecoder(value).sys.firstPublishedAt,
        author: authorDecoder(value).author.authorName,
    };
};

// Same as bedpresDecoder, but for a list of bedpreses.
const bedpresListDecoder = array(bedpresDecoder);

export const BedpresAPI = {
    getBedpreses: async (n: number): Promise<{ bedpreses: Array<Bedpres> | null; error: string | null }> => {
        try {
            const { data } = await API.post('', {
                query: GET_N_BEDPRESES,
                variables: {
                    n,
                },
            });

            return {
                bedpreses: bedpresListDecoder(data.data.bedpresCollection.items),
                error: null,
            };
        } catch (error) {
            return {
                bedpreses: null,
                error: `Error retrieveing ${n} bedpreses`,
            };
        }
    },

    getBedpresBySlug: async (slug: string): Promise<{ bedpres: Bedpres | null; error: string | null }> => {
        try {
            const { data } = await API.post('', {
                query: GET_BEDPRES_BY_SLUG,
                variables: {
                    slug,
                },
            });

            return {
                // Contentful returns a list with a single element,
                // therefore we need [0] to get the element out of the list.
                bedpres: bedpresListDecoder(data.data.bedpresCollection.items)[0],
                error: null,
            };
        } catch (error) {
            return {
                bedpres: null,
                error: `Bedpres '${slug}' not found`,
            };
        }
    },
};
