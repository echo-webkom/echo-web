import axios from 'axios';
import type { decodeType } from 'typescript-json-decoder';
import { array, literal, union } from 'typescript-json-decoder';
import type { ErrorMessage } from '@utils/error';

const studentGroups: Array<StudentGroup> = ['webkom', 'bedkom', 'gnist', 'tilde', 'hovedstyret'];

const studentGroupDecoder = union(
    literal('webkom'),
    literal('bedkom'),
    literal('gnist'),
    literal('tilde'),
    literal('hovedstyret'),
);
type StudentGroup = decodeType<typeof studentGroupDecoder>;

const DashboardAPI = {
    updateMembership: async (email: string, group: StudentGroup): Promise<Array<StudentGroup> | ErrorMessage> => {
        try {
            const { data, status } = await axios.put(`/api/studentgroup`, null, {
                params: { group, email },
                headers: {
                    'Content-Type': 'application/json',
                },
                validateStatus: (status: number) => status < 500,
            });

            if (status === 200) {
                return array(studentGroupDecoder)(data);
            }

            return { message: data };
        } catch {
            return {
                message: 'Failed @ updateMembership.',
            };
        }
    },
};

export default DashboardAPI;
export { studentGroups, type StudentGroup };
