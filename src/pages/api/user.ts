import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import axios from 'axios';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (session) {
        const idToken = session.idToken as string;

        const response = await axios.get('http://localhost:8080/token', {
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
        });

        res.status(200).send(response.data);
    } else {
        res.status(401);
    }

    res.end();
};

export default handler;
