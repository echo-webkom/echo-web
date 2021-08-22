import { rest } from 'msw';
import { setupServer } from 'msw/node';
import mockResponses, { RawMinute } from './mock-responses';
import { Minute, MinuteAPI } from '../minute';
import { GET_N_MINUTES } from '../schema';

interface QueryBody {
    query: string;
    variables?: {
        n?: number;
    };
}

const nMinutesToGet = 2;

const compare = (minute: Minute, json: RawMinute) => {
    expect(minute).toEqual({
        date: json.date,
        allmote: json.allmote,
        documentUrl: json.document.url,
    });
};

const server = setupServer(
    rest.post<QueryBody, string>(
        `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/${process.env.CONTENTFUL_ENVIRONMENT_ID}`,
        (req, res, ctx) => {
            const { query } = req.body;

            switch (query) {
                case GET_N_MINUTES:
                    return res(ctx.status(200), ctx.json(mockResponses.nMinutes));
                default:
                    return res(ctx.status(400));
            }
        },
    ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('getMinutes', () => {
    it('should return formatted data', async () => {
        const { minutes } = await MinuteAPI.getMinutes(nMinutesToGet);

        if (!minutes) fail(new Error(`getBedpreses(${nMinutesToGet}) returned null.`));

        minutes.map((minute, i) => compare(minute, mockResponses.nMinutes.data.meetingMinuteCollection.items[i]));
    });

    it('should return correct amount of bedpreses', async () => {
        const actualAmount = mockResponses.nMinutes.data.meetingMinuteCollection.items.length;
        const { minutes } = await MinuteAPI.getMinutes(actualAmount);

        expect(minutes?.length).toEqual(actualAmount);
    });

    it('should not return as null, and error should be null', async () => {
        const { minutes, error } = await MinuteAPI.getMinutes(nMinutesToGet);

        expect(minutes).not.toBeNull();
        expect(error).toBeNull();
    });
});
