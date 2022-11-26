import type { decodeType } from 'typescript-json-decoder';
import { array, literal, union } from 'typescript-json-decoder';
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

const studentGroupDecoder = union(
    literal('webkom'),
    literal('bedkom'),
    literal('gnist'),
    literal('tilde'),
    literal('hovedstyret'),
    literal('hyggkom'),
    literal('esc'),
    literal('makerspace'),
);
type StudentGroup = decodeType<typeof studentGroupDecoder>;

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

            if (response.status === 200) return array(studentGroupDecoder)(data);

            return { message: data };
        } catch (error) {
            return { message: JSON.stringify(error) };
        }
    },
};

export default DashboardAPI;
export { studentGroups, type StudentGroup };
