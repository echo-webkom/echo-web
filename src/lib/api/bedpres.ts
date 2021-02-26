import { Bedpres } from '../types';
import API from './api';
import { GET_BEDPRES_PATHS, GET_BEDPRES_BY_SLUG } from './schema';

const BedpresAPI = {
    getPaths: async (): Promise<Array<string>> => {
        try {
            const { data } = await API.post('', {
                query: GET_BEDPRES_PATHS,
            });

            return data.data.bedpresCollection.items.map((bedpres: { slug: string }) => bedpres.slug);
        } catch (error) {
            return [];
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
                bedpres: {
                    title: data.data.bedpresCollection.items[0].title,
                    slug: data.data.bedpresCollection.items[0].slug,
                    date: data.data.bedpresCollection.items[0].date,
                    spots: data.data.bedpresCollection.items[0].spots,
                    body: data.data.bedpresCollection.items[0].body,
                    logoUrl: data.data.bedpresCollection.items[0].logo.url,
                    location: data.data.bedpresCollection.items[0].location,
                    author: data.data.bedpresCollection.items[0].author,
                    companyLink: data.data.bedpresCollection.items[0].companyLink,
                    registrationLinks: data.data.bedpresCollection.items[0].registrationLinksCollection.items,
                    publishedAt: data.data.bedpresCollection.items[0].sys.firstPublishedAt,
                },
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
