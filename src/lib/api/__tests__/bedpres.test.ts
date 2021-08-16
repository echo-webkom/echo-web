import { rest } from 'msw';
import { setupServer } from 'msw/node';
import mockResponses, { RawBedpres } from './mock-responses';
import { Bedpres, BedpresAPI } from '../bedpres';
import { GET_BEDPRES_BY_SLUG, GET_N_BEDPRESES } from '../schema';

interface QueryBody {
    query: string;
    variables?: {
        n?: number;
        slug?: string;
    };
}

const validSlug = 'bedriftspresentasjon-med-bekk';
const nBedpresesToGet = 1;

const compare = (bedpres: Bedpres, json: RawBedpres) => {
    expect(bedpres).toEqual({
        title: json.title,
        slug: json.slug,
        date: json.date,
        spots: json.spots,
        body: json.body,
        logoUrl: json.logo?.url || null,
        location: json.location,
        author: json.author.authorName,
        companyLink: json.companyLink,
        additionalQuestions: json.additionalQuestionsCollection.items,
        publishedAt: json.sys.firstPublishedAt,
        registrationTime: json.registrationTime,
    });
};

const server = setupServer(
    rest.post<QueryBody, string>(
        `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/${process.env.CONTENTFUL_ENVIRONMENT_ID}`,
        (req, res, ctx) => {
            const { query, variables } = req.body;

            switch (query) {
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
        const { bedpres } = await BedpresAPI.getBedpresBySlug(validSlug);

        if (!bedpres) fail(new Error(`getBedpresBySlug(${validSlug}) returned null.`));

        compare(bedpres, mockResponses.bedpresBySlug.data.bedpresCollection.items[0]);
    });

    it('should not return bedpres as null, and error should be null when using a valid slug', async () => {
        const { bedpres, error } = await BedpresAPI.getBedpresBySlug(validSlug);

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
        const { bedpreses } = await BedpresAPI.getBedpreses(nBedpresesToGet);

        if (!bedpreses) fail(new Error(`getBedpreses(${nBedpresesToGet}) returned null.`));

        bedpreses.map((bedpres, i) => compare(bedpres, mockResponses.bedpresBySlug.data.bedpresCollection.items[i]));
    });

    it('should return correct amount of bedpreses', async () => {
        const actualAmount = mockResponses.nBedpreses.data.bedpresCollection.items.length;
        const { bedpreses } = await BedpresAPI.getBedpreses(actualAmount);

        expect(bedpreses?.length).toEqual(actualAmount);
    });

    it('should not return as null, and error should be null', async () => {
        const { bedpreses, error } = await BedpresAPI.getBedpreses(nBedpresesToGet);

        expect(bedpreses).not.toBeNull();
        expect(error).toBeNull();
    });
});
