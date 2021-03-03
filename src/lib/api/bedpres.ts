import moment from 'moment';
import { Author, Bedpres } from '../types';
import API from './api';
import { GET_BEDPRES_PATHS, GET_N_BEDPRESES, GET_BEDPRES_BY_SLUG } from './schema';

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

    getBedpreses: async (n: number): Promise<{ bedpreses: Array<Bedpres> | null; error: string | null }> => {
        try {
            const { data } = await API.post('', {
                query: GET_N_BEDPRESES,
                variables: {
                    n,
                },
            });

            return {
                bedpreses: data.data.bedpresCollection.items.map(
                    (bedpres: {
                        title: string;
                        slug: string;
                        date: string;
                        spots: number;
                        body: string;
                        logo: {
                            url: string;
                        };
                        location: string;
                        author: Author;
                        companyLink: string;
                        registrationLinksCollection: {
                            items: Array<{
                                link: string;
                                description: string;
                            }>;
                        };
                        sys: {
                            firstPublishedAt: string;
                        };
                        registrationTime: string;
                    }) => {
                        return {
                            title: bedpres.title,
                            slug: bedpres.slug,
                            date: bedpres.date,
                            spots: bedpres.spots,
                            body: bedpres.body,
                            logoUrl: bedpres.logo.url,
                            location: bedpres.location,
                            author: bedpres.author,
                            companyLink: bedpres.companyLink,
                            registrationLinks: moment(data.data.bedpresCollection.items[0].registrationTime).isBefore(
                                moment(),
                            )
                                ? data.data.bedpresCollection.items[0].registrationLinksCollection.items
                                : null,
                            publishedAt: bedpres.sys.firstPublishedAt,
                            registrationTime: bedpres.registrationTime,
                        };
                    },
                ),
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
                    registrationLinks: moment(data.data.bedpresCollection.items[0].registrationTime).isBefore(moment())
                        ? data.data.bedpresCollection.items[0].registrationLinksCollection.items
                        : null,
                    publishedAt: data.data.bedpresCollection.items[0].sys.firstPublishedAt,
                    registrationTime: data.data.bedpresCollection.items[0].registrationTime,
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
