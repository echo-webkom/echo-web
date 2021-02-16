import 'whatwg-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import mockResponses from './mock-responses';
import { EventAPI } from '..';
import { GET_EVENT_PATHS, GET_N_EVENTS, GET_EVENT_BY_SLUG } from '../schema';

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
            const { query, variables } = req.body;

            switch (query) {
                case GET_EVENT_PATHS:
                    return res(ctx.status(200), ctx.json(mockResponses.eventPaths));
                case GET_N_EVENTS:
                    return res(ctx.status(200), ctx.json(mockResponses.nEvents));
                case GET_EVENT_BY_SLUG:
                    // simulate slug not found
                    if (!variables) return res(ctx.status(400));
                    if (variables.slug !== mockResponses.eventBySlug.data.eventCollection.items[0].slug)
                        return res(ctx.status(400));

                    return res(ctx.status(200), ctx.json(mockResponses.eventBySlug));
                default:
                    return res(ctx.status(400));
            }
        },
    ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('getEventBySlug', () => {
    it('should return correct (formatted) data', async () => {
        const { event } = await EventAPI.getEventBySlug('bedpres-med-bekk');

        expect(event).toEqual({
            title: mockResponses.eventBySlug.data.eventCollection.items[0].title,
            slug: mockResponses.eventBySlug.data.eventCollection.items[0].slug,
            date: mockResponses.eventBySlug.data.eventCollection.items[0].date,
            spots: mockResponses.eventBySlug.data.eventCollection.items[0].spots,
            body: mockResponses.eventBySlug.data.eventCollection.items[0].body,
            imageUrl: mockResponses.eventBySlug.data.eventCollection.items[0].image.url,
            location: mockResponses.eventBySlug.data.eventCollection.items[0].location,
            publishedAt: mockResponses.eventBySlug.data.eventCollection.items[0].sys.firstPublishedAt,
            author: mockResponses.eventBySlug.data.eventCollection.items[0].author,
        });
    });

    it('should not return event as null, and error should be null when using a valid slug', async () => {
        const { event, error } = await EventAPI.getEventBySlug('bedpres-med-bekk');

        expect(event).not.toBeNull();
        expect(error).toBeNull();
    });

    it('should return event as null, and error not as null when using invalid slug', async () => {
        const { event, error } = await EventAPI.getEventBySlug('blablabla');

        expect(event).toBeNull();
        expect(error).not.toBeNull();
    });
});

describe('getEvents', () => {
    it('should return correct (formatted) data', async () => {
        const { events } = await EventAPI.getEvents(2);

        expect(events).toEqual([
            {
                title: mockResponses.nEvents.data.eventCollection.items[0].title,
                slug: mockResponses.nEvents.data.eventCollection.items[0].slug,
                date: mockResponses.nEvents.data.eventCollection.items[0].date,
                spots: mockResponses.nEvents.data.eventCollection.items[0].spots,
                body: mockResponses.nEvents.data.eventCollection.items[0].body,
                imageUrl: mockResponses.nEvents.data.eventCollection.items[0].image.url,
                location: mockResponses.nEvents.data.eventCollection.items[0].location,
                publishedAt: mockResponses.nEvents.data.eventCollection.items[0].sys.firstPublishedAt,
                author: mockResponses.nEvents.data.eventCollection.items[0].author,
            },
            {
                title: mockResponses.nEvents.data.eventCollection.items[1].title,
                slug: mockResponses.nEvents.data.eventCollection.items[1].slug,
                date: mockResponses.nEvents.data.eventCollection.items[1].date,
                spots: mockResponses.nEvents.data.eventCollection.items[1].spots,
                body: mockResponses.nEvents.data.eventCollection.items[1].body,
                imageUrl: mockResponses.nEvents.data.eventCollection.items[1].image.url,
                location: mockResponses.nEvents.data.eventCollection.items[1].location,
                publishedAt: mockResponses.nEvents.data.eventCollection.items[1].sys.firstPublishedAt,
                author: mockResponses.nEvents.data.eventCollection.items[1].author,
            },
        ]);
    });

    it('should return correct amount of events', async () => {
        const actualLength = mockResponses.nEvents.data.eventCollection.items.length;
        const { events } = await EventAPI.getEvents(2); // 2 is just a placeholder here. The mock data always returns 2 items

        expect(events?.length).toEqual(actualLength);
    });

    it('should not return as null, and error should be null', async () => {
        const { events, error } = await EventAPI.getEvents(2);

        expect(events).not.toBeNull();
        expect(error).toBeNull();
    });
});

describe('getPaths', () => {
    it('should return correct (formatted) data', async () => {
        const paths = await EventAPI.getPaths();

        expect(paths).toEqual([
            mockResponses.eventPaths.data.eventCollection.items[0].slug,
            mockResponses.eventPaths.data.eventCollection.items[1].slug,
        ]);
    });

    it('should return 10 or less slugs', async () => {
        const paths = await EventAPI.getPaths();

        expect(paths.length).toBeLessThanOrEqual(10);
    });

    // if an error occurs the api should return an empty array instead of null
    it('should not return null', async () => {
        const paths = await EventAPI.getPaths();

        expect(paths).not.toBeNull();
    });
});
