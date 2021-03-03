import 'whatwg-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import mockResponses from './mock-responses';
import { PostAPI } from '..';
import { GET_POST_PATHS, GET_N_POSTS, GET_POST_BY_SLUG } from '../schema';

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
                case GET_POST_PATHS:
                    return res(ctx.status(200), ctx.json(mockResponses.postPaths));
                case GET_N_POSTS:
                    return res(ctx.status(200), ctx.json(mockResponses.nPosts));
                case GET_POST_BY_SLUG:
                    // simulate slug not found
                    if (!variables) return res(ctx.status(400));
                    if (variables.slug !== mockResponses.postBySlug.data.postCollection.items[0].slug)
                        return res(ctx.status(400));

                    return res(ctx.status(200), ctx.json(mockResponses.postBySlug));
                default:
                    return res(ctx.status(400));
            }
        },
    ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('getPostBySlug', () => {
    it('should return correct (formatted) data', async () => {
        const { post } = await PostAPI.getPostBySlug('alle-ma-ha-hjemmekontor');

        expect(post).toEqual({
            title: mockResponses.postBySlug.data.postCollection.items[0].title,
            slug: mockResponses.postBySlug.data.postCollection.items[0].slug,
            body: mockResponses.postBySlug.data.postCollection.items[0].body,
            publishedAt: mockResponses.postBySlug.data.postCollection.items[0].sys.firstPublishedAt,
            author: mockResponses.postBySlug.data.postCollection.items[0].author,
        });
    });

    it('should not return post as null, error should be null when using a valid slug', async () => {
        const { post, error } = await PostAPI.getPostBySlug('alle-ma-ha-hjemmekontor');

        expect(post).not.toBeNull();
        expect(error).toBeNull();
    });

    it('should return event as null, and error not as null when using invalid slug', async () => {
        const { post, error } = await PostAPI.getPostBySlug('invalid-slug');

        expect(post).toBeNull();
        expect(error).not.toBeNull();
    });
});

describe('getPosts', () => {
    it('should return correct (formatted) data', async () => {
        const { posts } = await PostAPI.getPosts(4);

        expect(posts).toEqual([
            {
                title: mockResponses.nPosts.data.postCollection.items[0].title,
                slug: mockResponses.nPosts.data.postCollection.items[0].slug,
                body: mockResponses.nPosts.data.postCollection.items[0].body,
                publishedAt: mockResponses.nPosts.data.postCollection.items[0].sys.firstPublishedAt,
                author: mockResponses.nPosts.data.postCollection.items[0].author,
            },
            {
                title: mockResponses.nPosts.data.postCollection.items[1].title,
                slug: mockResponses.nPosts.data.postCollection.items[1].slug,
                body: mockResponses.nPosts.data.postCollection.items[1].body,
                publishedAt: mockResponses.nPosts.data.postCollection.items[1].sys.firstPublishedAt,
                author: mockResponses.nPosts.data.postCollection.items[1].author,
            },
            {
                title: mockResponses.nPosts.data.postCollection.items[2].title,
                slug: mockResponses.nPosts.data.postCollection.items[2].slug,
                body: mockResponses.nPosts.data.postCollection.items[2].body,
                publishedAt: mockResponses.nPosts.data.postCollection.items[2].sys.firstPublishedAt,
                author: mockResponses.nPosts.data.postCollection.items[2].author,
            },
            {
                title: mockResponses.nPosts.data.postCollection.items[3].title,
                slug: mockResponses.nPosts.data.postCollection.items[3].slug,
                body: mockResponses.nPosts.data.postCollection.items[3].body,
                publishedAt: mockResponses.nPosts.data.postCollection.items[3].sys.firstPublishedAt,
                author: mockResponses.nPosts.data.postCollection.items[3].author,
            },
        ]);
    });

    it('should return correct amount of posts', async () => {
        const actualAmount = mockResponses.nPosts.data.postCollection.items.length;
        const { posts } = await PostAPI.getPosts(4); // 4 is just a placeholder

        expect(posts?.length).toEqual(actualAmount);
    });

    it('should not return null, and error should be null', async () => {
        const { posts, error } = await PostAPI.getPosts(4);

        expect(posts).not.toBeNull();
        expect(error).toBeNull();
    });
});

describe('getPaths', () => {
    it('should return correct (formatted) data', async () => {
        const paths = await PostAPI.getPaths();

        expect(paths).toEqual([
            mockResponses.postPaths.data.postCollection.items[0].slug,
            mockResponses.postPaths.data.postCollection.items[1].slug,
            mockResponses.postPaths.data.postCollection.items[2].slug,
            mockResponses.postPaths.data.postCollection.items[3].slug,
            mockResponses.postPaths.data.postCollection.items[4].slug,
            mockResponses.postPaths.data.postCollection.items[5].slug,
        ]);
    });

    it('should return 10 or less slugs', async () => {
        const paths = await PostAPI.getPaths();

        expect(paths.length).toBeLessThanOrEqual(10);
    });

    // if an error occurs the api should return an empty array instead of null
    it('should not return null', async () => {
        const paths = await PostAPI.getPaths();

        expect(paths).not.toBeNull();
    });
});
