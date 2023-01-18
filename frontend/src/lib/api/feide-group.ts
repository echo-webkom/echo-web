import { z } from 'zod';
import type { ErrorMessage } from '@utils/error';

const feideGroupSchema = z.object({
    id: z.string(),
    displayName: z.string(),
    basic: z.enum(['member', 'admin', 'owner']).optional(),
    description: z.string().optional(),
    type: z.string().optional(),
    parent: z.string().optional(),
    notBefore: z.date().optional(),
    notAfter: z.date().optional(),
    public: z.boolean().optional(),
    active: z.boolean().optional(),
    url: z.string().optional(),
    primaryOrgUnit: z.boolean().optional(),
    membership: z.object({
        basic: z.enum(['member', 'admin', 'owner']).optional(),
        displayName: z.string().optional(),
        active: z.boolean().optional(),
        notBefore: z.date().optional(),
        fsroles: z.array(z.string()).optional(),
        subjectRelation: z.string().optional(),
        primaryOrgUnit: z.boolean().optional(),
        affiliation: z.array(z.string()).optional(),
        title: z.array(z.string()).optional(),
    }),
});
type FeideGroup = z.infer<typeof feideGroupSchema>;

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
                return feideGroupSchema.array().parse(data);
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

export { FeideGroupAPI, type FeideGroup, feideGroupSchema };
