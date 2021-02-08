import { AxiosResponse } from 'axios';
import Queries from './queries';

const PositiveResponse = (queryResult: any): AxiosResponse => ({
    data: queryResult,
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {},
});

const NegativeResponse: AxiosResponse = {
    data: {},
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {},
};

const PostAPI = {
    getPostBySlug: (negative = false): Promise<AxiosResponse> =>
        Promise.resolve(PositiveResponse(Queries.postBySlug.data)),
    getPaths: (negative = false): Promise<AxiosResponse> => Promise.resolve(PositiveResponse(Queries.postPaths.data)),
    getPosts: (n: number, negative = false): Promise<AxiosResponse> =>
        Promise.resolve(PositiveResponse(Queries.nPosts.data)),
};

export default PostAPI;
