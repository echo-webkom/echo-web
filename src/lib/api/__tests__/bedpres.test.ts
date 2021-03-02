import 'whatwg-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import mockResponses from './mock-responses';
import { BedpresAPI } from '..';
import { GET_BEDPRES_PATHS, GET_BEDPRES_BY_SLUG, GET_N_BEDPRESES } from '../schema';

interface QueryBody {
    query: string;
    variables?: {
        n?: number;
        slug?: string;
    };
}

const server = setupServer(
    rest.post<QueryBody, string>(
        `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/${process.env.CONTENTFUL_ENVIRONMENT_ID}`,
        (req, res, ctx) => {
            const { query, variables } = req.body;

            switch (query) {
                case GET_BEDPRES_PATHS:
                    return res(ctx.status(200), ctx.json(mockResponses.bedpresPaths));
                case GET_N_BEDPRESES:
                    return res(ctx.status(200), ctx.json(mockResponses.nBedpreses));
                case GET_BEDPRES_BY_SLUG:
                    if (!variables) return res(ctx.status(400));
                    if (variables.slug !== mockResponses.bedpresBySlug.data.bedpresCollection.items[0].slug)
                        return res(ctx.status(400));
                    return res(ctx.status(200), ctx.json(mockResponses.bedpresBySlug));
                default:
                    return res(ctx.status(400));
            }
        },
    ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('getBedpresBySlug', () => {
    it('should return correct (formatted) data', async () => {
        const { bedpres } = await BedpresAPI.getBedpresBySlug('bedriftspresentasjon-med-bekk');

        expect(bedpres).toEqual({
            title: mockResponses.bedpresBySlug.data.bedpresCollection.items[0].title,
            slug: mockResponses.bedpresBySlug.data.bedpresCollection.items[0].slug,
            date: mockResponses.bedpresBySlug.data.bedpresCollection.items[0].date,
            spots: mockResponses.bedpresBySlug.data.bedpresCollection.items[0].spots,
            body: mockResponses.bedpresBySlug.data.bedpresCollection.items[0].body,
            logoUrl: mockResponses.bedpresBySlug.data.bedpresCollection.items[0].logo.url,
            location: mockResponses.bedpresBySlug.data.bedpresCollection.items[0].location,
            author: mockResponses.bedpresBySlug.data.bedpresCollection.items[0].author,
            companyLink: mockResponses.bedpresBySlug.data.bedpresCollection.items[0].companyLink,
            registrationLinks:
                mockResponses.bedpresBySlug.data.bedpresCollection.items[0].registrationLinksCollection.items,
            publishedAt: mockResponses.bedpresBySlug.data.bedpresCollection.items[0].sys.firstPublishedAt,
            registrationTime: mockResponses.bedpresBySlug.data.bedpresCollection.items[0].registrationTime,
        });
    });

    it('should not return bedpres as null, and error should be null when using a valid slug', async () => {
        const { bedpres, error } = await BedpresAPI.getBedpresBySlug('bedriftspresentasjon-med-bekk');

        expect(bedpres).not.toBeNull();
        expect(error).toBeNull();
    });

    it('should return bedpres as null, and error not as null when using invalid slug', async () => {
        const { bedpres, error } = await BedpresAPI.getBedpresBySlug('blablabla');

        expect(bedpres).toBeNull();
        expect(error).not.toBeNull();
    });
});

describe('getBedpreses', () => {
    it('should return formatted data', async () => {
        const { bedpreses } = await BedpresAPI.getBedpreses(1);

        expect(bedpreses).toEqual([
            {
                title: mockResponses.bedpresBySlug.data.bedpresCollection.items[0].title,
                slug: mockResponses.bedpresBySlug.data.bedpresCollection.items[0].slug,
                date: mockResponses.bedpresBySlug.data.bedpresCollection.items[0].date,
                spots: mockResponses.bedpresBySlug.data.bedpresCollection.items[0].spots,
                body: mockResponses.bedpresBySlug.data.bedpresCollection.items[0].body,
                logoUrl: mockResponses.bedpresBySlug.data.bedpresCollection.items[0].logo.url,
                location: mockResponses.bedpresBySlug.data.bedpresCollection.items[0].location,
                author: mockResponses.bedpresBySlug.data.bedpresCollection.items[0].author,
                companyLink: mockResponses.bedpresBySlug.data.bedpresCollection.items[0].companyLink,
                registrationLinks:
                    mockResponses.bedpresBySlug.data.bedpresCollection.items[0].registrationLinksCollection.items,
                publishedAt: mockResponses.bedpresBySlug.data.bedpresCollection.items[0].sys.firstPublishedAt,
                registrationTime: mockResponses.bedpresBySlug.data.bedpresCollection.items[0].registrationTime,
            },
        ]);
    });

    it('should return correct amount of events', async () => {
        const actualLength = mockResponses.nBedpreses.data.bedpresCollection.items.length;
        const { bedpreses } = await BedpresAPI.getBedpreses(1);

        expect(bedpreses?.length).toEqual(actualLength);
    });

    it('should not return as null, and error should be null', async () => {
        const { bedpreses, error } = await BedpresAPI.getBedpreses(2);

        expect(bedpreses).not.toBeNull();
        expect(error).toBeNull();
    });
});

describe('getPaths', () => {
    it('should return formatted data', async () => {
        const paths = await BedpresAPI.getPaths();

        expect(paths).toEqual([mockResponses.bedpresPaths.data.bedpresCollection.items[0].slug]);
    });

    it('should return 10 or less slugs', async () => {
        const paths = await BedpresAPI.getPaths();

        expect(paths.length).toBeLessThanOrEqual(10);
    });

    // if an error occurs the api should return an empty array instead of null
    it('should not return null', async () => {
        const paths = await BedpresAPI.getPaths();

        expect(paths).not.toBeNull();
    });
});
