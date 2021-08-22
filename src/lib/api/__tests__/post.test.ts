import { rest } from 'msw';
import { setupServer } from 'msw/node';
import mockResponses, { RawPost } from './mock-responses';
import { PostAPI, Post } from '../post';
import { GET_POST_PATHS, GET_N_POSTS, GET_POST_BY_SLUG } from '../schema';

interface QueryBody {
    query: string;
    variables?: {
        n?: number;
        slug?: string;
    };
}

const compare = (post: Post, json: RawPost) => {
    expect(post).toEqual({
        title: json.title,
        slug: json.slug,
        body: json.body,
        publishedAt: json.sys.firstPublishedAt,
        author: json.author.authorName,
        thumbnail: json.thumbnail?.url || null,
    });
};

const nPostsToGet = 4;
const validSlug = 'alle-ma-ha-hjemmekontor';

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
        const { post } = await PostAPI.getPostBySlug(validSlug);

        if (!post) fail(new Error(`getPostBySlug(${validSlug}) returned null.`));

        compare(post, mockResponses.postBySlug.data.postCollection.items[0]);
    });

    it('should not return post as null, error should be null when using a valid slug', async () => {
        const { post, error } = await PostAPI.getPostBySlug(validSlug);

        expect(post).not.toBeNull();
        expect(error).toBeNull();
    });

    it('should return post as null, and error not as null when using invalid slug', async () => {
        const { post, error } = await PostAPI.getPostBySlug('invalid-slug');

        expect(post).toBeNull();
        expect(error).not.toBeNull();
    });
});

describe('getPosts', () => {
    it('should return correct (formatted) data', async () => {
        const { posts } = await PostAPI.getPosts(nPostsToGet);

        if (!posts) fail(new Error(`getPosts(${nPostsToGet}) returns null.`));

        posts.map((post, i) => compare(post, mockResponses.nPosts.data.postCollection.items[i]));
    });

    it('should return correct amount of posts', async () => {
        const actualAmount = mockResponses.nPosts.data.postCollection.items.length;
        const { posts } = await PostAPI.getPosts(actualAmount);

        expect(posts?.length).toEqual(actualAmount);
    });

    it('should not return null, and error should be null', async () => {
        const { posts, error } = await PostAPI.getPosts(nPostsToGet);

        expect(posts).not.toBeNull();
        expect(error).toBeNull();
    });
});

describe('getPaths', () => {
    it('should return correct (formatted) data', async () => {
        const paths = await PostAPI.getPaths();

        paths.map((postSlug, i) => expect(postSlug).toEqual(mockResponses.postPaths.data.postCollection.items[i].slug));
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
