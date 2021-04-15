import { parseISO, isBefore } from 'date-fns';
import { Pojo, array, record, string, number, decodeType } from 'typescript-json-decoder';
import API from './api';
import { GET_N_BEDPRESES, GET_BEDPRES_BY_SLUG } from './schema';

type Bedpres = decodeType<typeof bedpresDecoder>;
const bedpresDecoder = (value: Pojo) => {
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

    const publishedAtDecoder = record({
        sys: record({
            firstPublishedAt: string,
        }),
    });

    const authorDecoder = record({
        author: record({
            authorName: string,
        }),
    });

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

const bedpresListDecoder = array(bedpresDecoder);

const BedpresAPI = {
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

export default BedpresAPI;
