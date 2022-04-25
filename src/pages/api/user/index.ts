import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import axios from 'axios';
import { User, UserWithName } from '../../../lib/api';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (session) {
        const idToken = session.idToken as string;
        const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8080';

        if (req.method === 'GET') {
            // not authenticated
            if (!session.email || !session.name) {
                res.status(401);
                return;
            }
            const response = await axios.get(`${backendUrl}/user`, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
                validateStatus: (statusCode: number) => {
                    return statusCode < 500;
                },
            });

            // no user in database
            if (response.status === 404) {
                // not authenticated
                if (!session.email || !session.name) {
                    res.status(401);
                    return;
                }

                const user: UserWithName = {
                    email: session.email,
                    name: session.name,
                    degreeYear: null,
                    degree: null,
                };
                res.status(200).send(user);
            }

            const user: UserWithName = {
                email: session.email,
                name: session.name,
                degree: response.data.degree ?? null,
                degreeYear: response.data.degreeYear ?? null,
            };
            res.status(200).send(user);
            return;
        }

        if (req.method === 'PUT') {
            const user: User = {
                email: req.body.email,
                degree: req.body.degree,
                degreeYear: req.body.degreeYear,
            };

            const response = await axios.put(`${backendUrl}/user`, user, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                },
            });

            // not authenticated
            if (response.status === 401) {
                res.status(401);
                return;
            }

            res.status(200).send(response.data);
        }

        // method not valid
        res.status(400);

        return;
    }

    // not authenticated
    res.status(401);
};

export default handler;
