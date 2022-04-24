import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

import axios from 'axios';
import { getSession } from 'next-auth/react';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (session) {
        const idToken = session.idToken as string;

        const response = await axios.get('http://localhost:8080/user', {
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
            validateStatus: (statusCode: number) => {
                return statusCode < 500;
            },
        });

        if (response.status === 404) {
            //no user in database
            const session = await getSession({ req });
            const user = {
                name: session?.user?.name,
                email: session?.user?.email,
                degree: null,
                grade: null,
            };
            res.status(200).send(user);
        } else {
            res.status(200).send(response.data);
        }
    } else {
        res.status(401);
    }

    res.end();
};

export default handler;
