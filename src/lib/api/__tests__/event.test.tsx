import EventAPI from '../event';
import Queries from '../__mocks__/queries';

jest.mock('../event');

describe('GetEventBySlug', () => {
    test('API call does not change the original data', () => {
        const originalData = Queries.eventBySlug.data;
        EventAPI.getEventBySlug('').then(({ data }) => {
            expect(data).toEqual(originalData);
        });
    });
});

describe('GetEvents', () => {
    test('API call does not change the original data', () => {
        const originalData = Queries.nEvents.data;
        EventAPI.getEvents(0).then(({ data }) => {
            expect(data).toEqual(originalData);
        });
    });
});

describe('GetPaths', () => {
    test('API call does not change the original data', () => {
        const originalData = Queries.eventPaths.data;
        EventAPI.getPaths().then(({ data }) => {
            expect(data).toEqual(originalData);
        });
    });
});
