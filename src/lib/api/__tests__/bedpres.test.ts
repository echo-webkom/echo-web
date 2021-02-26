import 'whatwg-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import mockResponses from './mock-responses';
import { BedpresAPI } from '..';
import { GET_BEDPRES_BY_SLUG } from '../schema';

interface QueryBody {
    query: string;
    variables?: {
        n?: number;
        slug?: string;
    };
}

const server = setupServer(
    rest.post<QueryBody, string>(
        `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
        (req, res, ctx) => {
            const { query } = req.body;

            switch (query) {
                case GET_BEDPRES_BY_SLUG:
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
        });
    });
});
