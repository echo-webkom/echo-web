import React from 'react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { isBefore } from 'date-fns';
import { render } from './testing-utils';
import mockResponses from '../../lib/api/__tests__/mock-responses';
import BedpresBlock from '../bedpres-block';
import { BedpresAPI } from '../../lib/api/bedpres';

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
            return res(ctx.status(200), ctx.json(mockResponses.nBedpreses));
        },
    ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('BedpresBlock', () => {
    it('renders without crashing', () => {
        const { getByTestId } = render(<BedpresBlock bedpreses={null} error={null} />);
        expect(getByTestId(/bedpres-block/i)).toBeInTheDocument();
    });

    it('renders every recieved bedpres recieved correctly', async () => {
        const { bedpreses } = await BedpresAPI.getBedpreses(4);
        const { getByTestId } = render(<BedpresBlock bedpreses={bedpreses} error={null} />);

        expect(bedpreses).not.toBe(null);
        // 3 most upcoming bedpreses (except the ones who have happened) in bedpreses is rendered
        if (bedpreses) {
            bedpreses.slice(0, 3).forEach((bedpres) => {
                if (isBefore(new Date().setHours(0, 0, 0, 0), new Date(bedpres.date)))
                    expect(getByTestId(new RegExp(bedpres.slug, 'i'))).toBeInTheDocument();
            });
        }
    });
});
