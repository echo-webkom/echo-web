import React from 'react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render } from './testing-utils';
import mockResponses from '../../lib/api/__tests__/mock-responses';
import EventBlock from '../event-block';
import { EventAPI } from '../../lib/api/event';

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
        (_, res, ctx) => {
            return res(ctx.status(200), ctx.json(mockResponses.nEvents));
        },
    ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('EventBlock', () => {
    it('renders without crashing', () => {
        const { getByTestId } = render(<EventBlock events={null} error={null} />);
        expect(getByTestId(/event-block/i)).toBeInTheDocument();
    });

    it('renders every recieved event correctly', async () => {
        const { events } = await EventAPI.getEvents(3);
        const { getByTestId } = render(<EventBlock events={events} error={null} />);

        expect(events).not.toBe(null);

        if (events) {
            events.forEach((event) => {
                expect(getByTestId(new RegExp(`^${event.slug}$`, 'i'))).toBeInTheDocument();
            });
        }
    });
});
