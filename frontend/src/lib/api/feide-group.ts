import type { decodeType } from 'typescript-json-decoder';
import { literal, union, date, record, boolean, optional, string, array } from 'typescript-json-decoder';
import type { ErrorMessage } from '@utils/error';

const feideGroupDecoder = record({
    id: string,
    displayName: string,
    basic: optional(union(literal('member'), literal('admin'), literal('owner'))),
    description: optional(string),
    type: optional(string),
    parent: optional(string),
    notBefore: optional(date),
    notAfter: optional(date),
    public: optional(boolean),
    active: optional(boolean),
    url: optional(string),
    primaryOrgUnit: optional(boolean),
    membership: record({
        basic: optional(union(literal('member'), literal('admin'), literal('owner'))),
        displayName: optional(string),
        active: optional(boolean),
        notBefore: optional(date),
        fsroles: optional(array(string)),
        subjectRelation: optional(string),
        primaryOrgUnit: optional(boolean),
        affiliation: optional(array(string)),
        title: optional(array(string)),
    }),
});
type FeideGroup = decodeType<typeof feideGroupDecoder>;

const feideGroupEndpoint = 'https://groups-api.dataporten.no/groups';

const FeideGroupAPI = {
    isMemberOfGroup: async (accessToken: string, groupId: string): Promise<boolean> => {
        try {
            const response = await fetch(`${feideGroupEndpoint}/me/groups/${groupId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const data = await response.json();

            if (response.status === 200 && data?.basic === 'member' && data?.primaryOrgUnit === true) {
                return true;
            }

            return false;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(error);
            return false;
        }
    },

    getGroups: async (accessToken: string): Promise<Array<FeideGroup> | ErrorMessage> => {
        try {
            const response = await fetch(`${feideGroupEndpoint}/me/groups`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const data = await response.json();

            if (response.status === 200) {
                return array(feideGroupDecoder)(data);
            }

            return {
                message: `Error fetching groups, status: ${response.status}.`,
            };
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(error);
            return { message: JSON.stringify(error) };
        }
    },
};

export { FeideGroupAPI, type FeideGroup, feideGroupDecoder };
