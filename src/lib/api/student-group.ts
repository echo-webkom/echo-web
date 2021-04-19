import API from './api';
import { StudentGroup, StudentGroupRaw, RoleRaw, ProfileRaw } from '../types';
import { GET_STUDENTGROUPS_BY_TYPE } from './schema';

const StudentGroupAPI = {
    getStudentGroups: async (type: string): Promise<Array<StudentGroup>> => {
        try {
            const { data } = await API.post('', {
                query: GET_STUDENTGROUPS_BY_TYPE,
                variables: {
                    type,
                },
            });

            return data.data.studentGroupCollection.items.map((studentGroup: StudentGroupRaw) => {
                return {
                    name: studentGroup.name,
                    info: studentGroup.info,
                    roles: studentGroup.rolesCollection
                        ? studentGroup.rolesCollection.items.map((role: RoleRaw) => {
                              return {
                                  name: role.name,
                                  members: role.membersCollection
                                      ? role.membersCollection.items.map((profile: ProfileRaw) => {
                                            return {
                                                name: profile.name,
                                                imageUrl: profile.picture ? profile.picture.url : null,
                                            };
                                        })
                                      : [],
                              };
                          })
                        : [],
                };
            });
        } catch (error) {
            return [];
        }
    },
};

export default StudentGroupAPI;
