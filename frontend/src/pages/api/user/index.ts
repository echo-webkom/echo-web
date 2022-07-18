import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import axios from 'axios';
import type { User, UserWithName } from '@api/user';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getToken({ req });

    if (session) {
        const idToken = session.idToken as string;
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';

        if (req.method === 'GET') {
            // not authenticated
            if (!session.email || !session.name) {
                res.status(401).end();
                return;
            }

            try {
                const response = await axios.get(`${backendUrl}/user`, {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                    validateStatus: (statusCode: number) => statusCode < 500,
                });

                // no user in database
                if (response.status === 404) {
                    // not authenticated
                    if (!session.email || !session.name) {
                        res.status(401).end();
                        return;
                    }

                    const user: UserWithName = {
                        email: session.email,
                        name: session.name,
                        alternateEmail: null,
                        degreeYear: null,
                        degree: null,
                    };

                    res.status(200).end(JSON.stringify(user));
                    return;
                }

                const user: UserWithName = {
                    email: session.email,
                    name: session.name,
                    alternateEmail: response.data.alternateEmail ?? null,
                    degree: response.data.degree ?? null,
                    degreeYear: response.data.degreeYear ?? null,
                };

                res.status(200).end(JSON.stringify(user));
                return;
            } catch (error) {
                res.status(500).end(JSON.stringify(error));
                return;
            }
        }

        if (req.method === 'PUT') {
            const user: User = {
                email: req.body.email,
                alternateEmail: req.body.alternateEmail,
                degree: req.body.degree,
                degreeYear: req.body.degreeYear,
            };

            try {
                const response = await axios.put(`${backendUrl}/user`, user, {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                        'Content-Type': 'application/json',
                    },
                    validateStatus: (statusCode) => statusCode < 500,
                });

                // not authenticated
                if (response.status === 401) {
                    res.status(401).end();
                    return;
                }

                // bad request
                if (response.status === 400) {
                    res.status(400).end(JSON.stringify(response.data));
                    return;
                }

                res.status(200).end(JSON.stringify(response.data));
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
