import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getToken({ req });

    if (session) {
        const JWT_TOKEN = session.idToken;

        if (req.method === 'GET') {
            if (!session.email || !session.name) {
                res.status(401).end();
                return;
            }

            res.status(200).json(JWT_TOKEN);
            return;
        }
    }

    res.status(401).end();
};

export default handler;
