import { rest } from 'msw';
import { setupServer } from 'msw/node';
import mockResponses, { RawEvent } from './mock-responses';
import { EventAPI, Event } from '../event';
import { GET_EVENT_PATHS, GET_N_EVENTS, GET_EVENT_BY_SLUG } from '../schema';

interface QueryBody {
    query: string;
    variables?: {
        n?: number;
        slug?: string;
    };
}

const nEventsToGet = 2;
const validSlug = 'sick-event-bruh';

const compare = (post: Event, json: RawEvent) => {
    expect(post).toEqual({
        title: json.title,
        slug: json.slug,
        date: json.date,
        spots: json.spots,
        body: json.body,
        imageUrl: json.image?.url || null,
        location: json.location,
        publishedAt: json.sys.firstPublishedAt,
        author: json.author.authorName,
    });
};

const server = setupServer(
    rest.post<QueryBody, string>(
        `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/${process.env.CONTENTFUL_ENVIRONMENT_ID}`,
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
        const { event } = await EventAPI.getEventBySlug(validSlug);

        if (!event) fail(new Error(`getEventBySlug(${validSlug}) returned null.`));

        compare(event, mockResponses.eventBySlug.data.eventCollection.items[0]);
    });

    it('should not return event as null, and error should be null when using a valid slug', async () => {
        const { event, error } = await EventAPI.getEventBySlug(validSlug);

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
        const { events } = await EventAPI.getEvents(nEventsToGet);

        if (!events) fail(new Error(`getEvents(${nEventsToGet}) returned null.`));

        events.map((event, i) => compare(event, mockResponses.nEvents.data.eventCollection.items[i]));
    });

    it('should return correct amount of events', async () => {
        const actualAmount = mockResponses.nEvents.data.eventCollection.items.length;
        const { events } = await EventAPI.getEvents(actualAmount);

        expect(events?.length).toEqual(actualAmount);
    });

    it('should not return as null, and error should be null', async () => {
        const { events, error } = await EventAPI.getEvents(nEventsToGet);

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
