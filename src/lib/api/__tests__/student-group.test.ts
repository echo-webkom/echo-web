import { rest } from 'msw';
import { setupServer } from 'msw/node';
import mockResponses, { RawStudentGroup, RawProfile, RawRole } from './mock-responses';
import { StudentGroupAPI, StudentGroup } from '../student-group';
import { GET_STUDENTGROUPS_BY_TYPE } from '../schema';

interface QueryBody {
    query: string;
    variables?: {
        type?: string;
    };
}

const validTypes = ['subgroup', 'suborg', 'board'];

const compare = (studentGroup: StudentGroup, json: RawStudentGroup) => {
    expect(studentGroup).toEqual({
        name: json.name,
        info: json.info,
        roles: json.rolesCollection.items.map((jsonRole: RawRole) => {
            return {
                name: jsonRole.name,
                members: jsonRole.membersCollection.items.map((jsonProfile: RawProfile) => {
                    return {
                        name: jsonProfile.name,
                        pictureUrl: jsonProfile.picture?.url || null,
                    };
                }),
            };
        }),
    });
};

const server = setupServer(
    rest.post<QueryBody, string>(
        `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/${process.env.CONTENTFUL_ENVIRONMENT_ID}`,
        (req, res, ctx) => {
            const { query, variables } = req.body;

            switch (query) {
                case GET_STUDENTGROUPS_BY_TYPE:
                    if (!variables) return res(ctx.status(400));
                    if (!variables.type) return res(ctx.status(400));
                    if (!validTypes.includes(variables?.type)) return res(ctx.status(400));
                    return res(ctx.status(200), ctx.json(mockResponses.studentGroupByType));
                default:
                    return res(ctx.status(400));
            }
        },
    ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('getStudentGroupsType', () => {
    it('should return correct (formatted) data', async () => {
        const { studentGroups } = await StudentGroupAPI.getStudentGroupsByType(validTypes[0]);

        if (!studentGroups) fail(new Error(`getStudentGroupsByType(${validTypes[0]}) returned null.`));

        studentGroups.map((studentGroup, i) => {
            return compare(studentGroup, mockResponses.studentGroupByType.data.studentGroupCollection.items[i]);
        });
    });

    it('should return correct amount of student groups when, and should not return an empty array when given a valid type', async () => {
        const actualAmount = mockResponses.studentGroupByType.data.studentGroupCollection.items.length;
        const { studentGroups, error } = await StudentGroupAPI.getStudentGroupsByType(validTypes[0]);

        expect(studentGroups?.length).toEqual(actualAmount);
        expect(error).toBeNull();
    });

    it('should return studentGroups as empty array, and error not as null when using an invalid type', async () => {
        const { studentGroups, error } = await StudentGroupAPI.getStudentGroupsByType('blablabla');

        expect(studentGroups?.length).toEqual(0);
        expect(error).not.toBeNull();
    });
});
