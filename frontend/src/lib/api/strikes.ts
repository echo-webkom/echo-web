import { ErrorMessage, isErrorMessage } from '@utils/error';
import { parseISO } from 'date-fns';
import { z } from 'zod';

const strikesSchema = z.object({
    userEmail: z.string(),
    reason: z.string().nullable().optional(),
    createdAt: z.string().transform((date) => parseISO(date)),
    modifiedAt: z.string().transform((date) => parseISO(date)),
});

type Strike = z.infer<typeof strikesSchema>;

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';

const StrikesAPI = {
    getAllStrikes: async (idToken: string): Promise<Strike[] | ErrorMessage> => {
        try {
            const response = await fetch(`${BACKEND_URL}/strikes`, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });

            // no user in database
            if (response.status === 404) {
                return [];
            }

            if (response.status === 401) {
                return { message: '401' };
            }

            const data = await response.json();

            return strikesSchema.array().parse(data);
        } catch (error) {
            return { message: '500' };
        }
    },

    getStrikesByUser: async (idToken: string, userEmail: string): Promise<Strike[] | ErrorMessage> => {
        try {
            const response = await fetch(`${BACKEND_URL}/strikes/${userEmail}`, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });

            // no user in database
            if (response.status === 404) {
                return [];
            }

            if (response.status === 401) {
                return { message: '401' };
            }

            const data = await response.json();

            return strikesSchema.array().parse(data);
        } catch (error) {
            return { message: '500' };
        }
    },

    createStrike: async (idToken: string, strike: Strike): Promise<Strike | ErrorMessage> => {
        try {
            const response = await fetch(`${BACKEND_URL}/strikes`, {
                method: 'POST',
                body: JSON.stringify(strike),
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
            });

            const data = await response.json();

            if (isErrorMessage(data)) {
                return data;
            }

            return strikesSchema.parse(data);
        } catch (error) {
            return { message: '500' };
        }
    },

    // deleteStrike: async (idToken: string, strike: Strike): Promise<Strike | ErrorMessage> => {
    //     try {
    //         const response = await fetch(`${BACKEND_URL}/strikes`, {
    //             method: 'DELETE',
    //             body: JSON.stringify(strike),
    //             headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    //         });

    //         const data = await response.json();

    //         if (isErrorMessage(data)) {
    //             return data;
    //         }

    //         return strikesSchema.parse(data);
    //     } catch (error) {
    //         return { message: '500' };
    //     }
    // }
};

export { StrikesAPI, strikesSchema, type Strike };
