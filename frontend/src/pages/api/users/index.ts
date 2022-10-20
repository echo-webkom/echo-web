import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getToken({ req });

    if (session) {
        const JWT_TOKEN = session.idToken as string;

        if (req.method === 'GET') {
            const { email, name } = session;

            // not authenticated
            if (!email || !name) {
                res.status(401).end();
                return;
            }

            try {
                const { data, status } = await axios.get(`${BACKEND_URL}/users`, {
                    headers: {
                        Authorization: `Bearer ${JWT_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    validateStatus: (statusCode: number) => statusCode < 500,
                });

                if (status === 200) {
                    res.status(200).send(data);
                    return;
                }

                res.status(status).end();
                return;
            } catch (error) {
                res.status(500).end(JSON.stringify(error));
                return;
            }
        }

        // method not valid
        res.status(400).end();
        return;
    }

    // not authenticated
    res.status(401).end();
};

export default handler;
