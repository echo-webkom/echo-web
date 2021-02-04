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

const EventAPI = {
    getEventBySlug: (negative = false): Promise<AxiosResponse> =>
        Promise.resolve(PositiveResponse(Queries.eventBySlug.data)),
    getPaths: (negative = false): Promise<AxiosResponse> => Promise.resolve(PositiveResponse(Queries.eventPaths.data)),
    getEvents: (n: number, negative = false): Promise<AxiosResponse> =>
        Promise.resolve(PositiveResponse(Queries.nEvents.data)),
};

export default EventAPI;
