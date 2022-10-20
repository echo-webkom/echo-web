import axios from 'axios';
import type { ErrorMessage } from '@utils/error';

type StudentGroup = 'webkom' | 'bedkom' | 'gnist' | 'tilde' | 'hovedstyret';
const studentGroups: Array<StudentGroup> = ['webkom', 'bedkom', 'gnist', 'tilde', 'hovedstyret'];

const DashboardAPI = {
    updateMembership: async (email: string, memberships: Array<String>): Promise<string | ErrorMessage> => {
        try {
            const { status } = await axios.put(
                '/api/membership',
                {
                    email,
                    memberships,
                },
                {
                    validateStatus: (statusCode: number) => statusCode < 500,
                },
            );

            if (status === 200) {
                return `Brukeren ${email} er nå med i ${memberships.join(', ')}.`;
            }

            return {
                message: 'Kunne ikke oppdatere medlemskap.',
            };
        } catch {
            return {
                message: `Failed to update membership of ${email}.`,
            };
        }
    },
};

export default DashboardAPI;
export { studentGroups, type StudentGroup };
