import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getToken({ req });

    if (session) {
        const JWT_TOKEN = session.idToken as string;

        if (!session.email || !session.name) {
            res.status(401).json({ message: 'Du må være logget inn for å se denne siden.' });
            return;
        }

        if (req.method === 'GET') {
            const slug = req.query.slug as string;

            try {
                const { data, status } = await axios.get(`${BACKEND_URL}/reaction/${slug}`, {
                    headers: {
                        Authorization: `Bearer ${JWT_TOKEN}`,
                    },
                    validateStatus: (status: number) => status < 500,
                });

                if (status === 404) {
                    res.status(404).json({ message: 'Kunne ikke finne arrangementet.' });
                    return;
                }

                if (status === 401) {
                    res.status(401).json({ message: 'Du må være logget inn for å se reaksjoner for arrangementet.' });
                    return;
                }

                res.status(200).json(data);
                return;
            } catch {
                res.status(500).json({ message: 'Noe gikk galt. Prøv igjen senere.' });
                return;
            }
        }

        if (req.method === 'PUT') {
            const slug = req.query.slug as string;
            const reaction = req.query.reaction as string;

            try {
                const { data, status } = await axios.put(`${BACKEND_URL}/reaction`, null, {
                    params: { slug, reaction },
                    headers: {
                        Authorization: `Bearer ${JWT_TOKEN}`,
                    },
                    validateStatus: (statusCode: number) => statusCode < 500,
                });

                if (status === 200) {
                    res.status(200).send(data);
                    return;
                }

                res.status(401).json({ message: 'Du har ikke tilgang til denne funksjonen.' });
                return;
            } catch {
                res.status(500).json({ message: 'Noe gikk galt. Prøv igjen senere.' });
                return;
            }
        }
    }

    res.status(401).json({ message: 'Du har ikke tilgang til denne siden.' });
};

export default handler;
