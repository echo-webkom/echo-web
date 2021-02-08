import PostAPI from '../post';
import Queries from '../__mocks__/queries';

jest.mock('../post');

describe('GetPostBySlug', () => {
    test('API call does not change the original data', () => {
        const originalData = Queries.postBySlug.data;
        PostAPI.getPostBySlug('').then(({ data }) => {
            expect(data).toEqual(originalData);
        });
    });
});

describe('GetPosts', () => {
    test('API call does not change the original data', () => {
        const originalData = Queries.nPosts.data;
        PostAPI.getPosts(0).then(({ data }) => {
            expect(data).toEqual(originalData);
        });
    });
});

describe('GetPostPaths', () => {
    test('API call does not change the original data', () => {
        const originalData = Queries.postPaths.data;
        PostAPI.getPaths().then(({ data }) => {
            expect(data).toEqual(originalData);
        });
    });
});
