import { z } from 'zod';
import type { ErrorMessage } from '@utils/error';

const studentGroups: Array<StudentGroup> = [
    'webkom',
    'bedkom',
    'gnist',
    'tilde',
    'hovedstyret',
    'hyggkom',
    'esc',
    'makerspace',
];

const studentGroupSchema = z.enum([
    'webkom',
    'bedkom',
    'gnist',
    'tilde',
    'hovedstyret',
    'hyggkom',
    'esc',
    'makerspace',
]);
type StudentGroup = z.infer<typeof studentGroupSchema>;

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';

const DashboardAPI = {
    updateMembership: async (
        email: string,
        group: StudentGroup,
        idToken: string,
    ): Promise<Array<StudentGroup> | ErrorMessage> => {
        try {
            const params = new URLSearchParams({ email, group }).toString();

            const response = await fetch(`${BACKEND_URL}/studentgroup?${params}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });

            const data = await response.json();

            if (response.status === 200) return studentGroupSchema.array().parse(data);

            return { message: data };
        } catch (error) {
            return { message: JSON.stringify(error) };
        }
    },
};

export default DashboardAPI;
export { studentGroups, type StudentGroup };
