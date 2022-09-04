import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getToken({ req });

    if (session) {
        const JWT_TOKEN = session.idToken as string;
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';

        if (req.method === 'GET') {
            if (!session.email || !session.name) {
                res.status(401).end();
                return;
            }

            const { data, status } = await axios.get(`${BACKEND_URL}/isadmin`, {
                headers: {
                    Authorization: `Bearer ${JWT_TOKEN}`,
                },
            });

            if (status === 200) {
                res.status(200).json(data);
                return;
            }

            res.status(401).json({ message: 'Du har ikke tilgang til denne siden.' });
            return;
        }
    }

    res.status(401).end();
};

export default handler;
