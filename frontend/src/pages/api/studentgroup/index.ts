import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getToken({ req });

    if (session) {
        const JWT_TOKEN = session.idToken as string;

        if (req.method === 'PUT') {
            const { email, name } = session;

            // not authenticated
            if (!email || !name) {
                res.status(401).end();
                return;
            }

            const userEmail = req.query.email as string;
            const group = req.query.group as string;

            try {
                const { data, status } = await axios.put(`${BACKEND_URL}/studentgroup`, null, {
                    params: { group, email: userEmail },
                    headers: {
                        Authorization: `Bearer ${JWT_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    validateStatus: (status: number) => status < 500,
                });

                res.status(status).json(data);
                return;
            } catch {
                console.log('Fail @ /studentgroup'); // eslint-disable-line no-console
                res.status(500).end();
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
