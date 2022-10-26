import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import axios from 'axios';
import { userDecoder } from '@api/user';
import type { User } from '@api/user';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getToken({ req });

    if (session) {
        const idToken = session.idToken as string;

        if (req.method === 'GET') {
            const { email, name } = session;

            // not authenticated
            if (!email || !name) {
                res.status(401).end();
                return;
            }
            try {
                const response = await axios.get(`${BACKEND_URL}/user`, {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                    validateStatus: (statusCode: number) => statusCode < 500,
                });

                // no user in database
                if (response.status === 404) {
                    const user: User = {
                        email: email,
                        name: name,
                        alternateEmail: null,
                        degreeYear: null,
                        degree: null,
                        memberships: [],
                    };

                    res.status(200).end(JSON.stringify(user));
                    return;
                }

                const user: User = userDecoder(response.data);

                res.status(200).end(JSON.stringify({ ...user, name, email }));
                return;
            } catch (error) {
                res.status(500).end(JSON.stringify(error));
                return;
            }
        }

        if (req.method === 'POST') {
            const { email, name } = session;

            if (!email || !name) {
                res.status(401).end();
                return;
            }

            try {
                const response = await axios.post(
                    `${BACKEND_URL}/user?email=${email.toLowerCase()}&name=${name.toLowerCase()}`,
                    {
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                        },
                        validateStatus: (statusCode: number) => statusCode < 500,
                    },
                );

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

        if (req.method === 'PUT') {
            const user: User = {
                email: req.body.email,
                name: req.body.name,
                alternateEmail: req.body?.alternateEmail ?? null,
                degree: req.body?.degree ?? null,
                degreeYear: req.body.degreeYear,
                memberships: [],
            };

            try {
                const response = await axios.put(`${BACKEND_URL}/user`, user, {
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
