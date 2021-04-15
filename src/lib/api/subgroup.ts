import API from './api';
import { Subgroup, SubgroupRaw, RoleRaw, ProfileRaw } from '../types';
import { GET_SUBGROUPS } from './schema';

const SubgroupAPI = {
    getSubgroups: async (): Promise<Array<Subgroup>> => {
        try {
            const { data } = await API.post('', {
                query: GET_SUBGROUPS,
            });

            return data.data.subgroupCollection.items.map((subgroup: SubgroupRaw) => {
                return {
                    name: subgroup.name,
                    info: subgroup.info,
                    roles: subgroup.rolesCollection
                        ? subgroup.rolesCollection.items.map((role: RoleRaw) => {
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

export default SubgroupAPI;
