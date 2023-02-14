import type { Registration } from './registration';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';

const WaitinglistAPI = {
    checkIfCanPromote: async (slug: string, idToken: string): Promise<{ bool: boolean }> => {
        try {
            const res = await fetch(`${BACKEND_URL}/registration/promote/can_promote/${slug}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });
            return {
                bool: res.status === 200,
            };
        } catch {
            return {
                bool: false,
            };
        }
    },

    promoteDirectly: async (registration: Registration, idToken: string): Promise<{ statusCode: number }> => {
        try {
            // eslint-disable-next-line no-console
            console.log('promoteDirectly');
            const res = await fetch(
                `${BACKEND_URL}/registration/promote/noemail/${registration.slug}/${registration.email}`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                },
            );
            return {
                statusCode: res.status,
            };
        } catch {
            return {
                statusCode: 500,
            };
        }
    },

    promoteSendEmail: async (registration: Registration, idToken: string): Promise<{ statusCode: number }> => {
        try {
            const res = await fetch(
                `${BACKEND_URL}/registration/promote/email/${registration.slug}/${registration.email}`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                },
            );
            return {
                statusCode: res.status,
            };
        } catch {
            return {
                statusCode: 500,
            };
        }
    },

    promoteUUID: async (uuid: string): Promise<{ statusCode: number }> => {
        try {
            const res = await fetch(`${BACKEND_URL}/registration/promote/${uuid}`, {
                method: 'POST',
            });
            return {
                statusCode: res.status,
            };
        } catch {
            return {
                statusCode: 500,
            };
        }
    },
};

export default WaitinglistAPI;