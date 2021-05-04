import React from 'react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render } from './testing-utils';
import mockResponses from '../../lib/api/__tests__/mock-responses';
import PostBlock from '../post-block';
import { PostAPI } from '../../lib/api/post';

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
            return res(ctx.status(200), ctx.json(mockResponses.nPosts));
        },
    ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('PostBlock', () => {
    it('renders without crashing', () => {
        const { getByTestId } = render(<PostBlock posts={null} error={null} />);
        expect(getByTestId(/post-block/i)).toBeInTheDocument();
    });

    it('renders every recieved post correctly', async () => {
        const { posts } = await PostAPI.getPosts(8);
        const { getByTestId } = render(<PostBlock posts={posts} error={null} />);

        expect(posts).not.toBe(null);

        if (posts) {
            posts.forEach((post) => {
                expect(getByTestId(new RegExp(`^${post.slug}$`, 'i'))).toBeInTheDocument();
            });
        }
    });
});
