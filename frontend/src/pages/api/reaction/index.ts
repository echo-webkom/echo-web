import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import axios from 'axios';
import { reactionDecoder } from '@api/reaction';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getToken({ req });

    if (session) {
        const JWT_TOKEN = session.idToken as string;

        if (!session.email || !session.name) {
            res.status(401).json({ message: 'Du må være logget inn for å se denne siden.' });
            return;
        }

        // NOTE: Not in use. Here for later.
        if (req.method === 'GET') {
            const slug = req.query.slug as string;
            if (!slug) {
                res.status(400).json({ message: 'Mangler slug.' });
                return;
            }

            try {
                const { data, status } = await axios.get(`${BACKEND_URL}/reaction/${slug}`, {
                    headers: {
                        Authorization: `Bearer ${JWT_TOKEN}`,
                    },
                    validateStatus: (statusCode: number) => statusCode < 500,
                });

                if (status === 200) {
                    res.status(200).json(reactionDecoder(data));
                    return;
                }

                res.status(401).json({ message: 'Du har ikke tilgang til denne siden.' });
                return;
            } catch {
                res.status(500).json({ message: 'Noe gikk galt. Prøv igjen senere.' });
                return;
            }
        }

        if (req.method === 'POST') {
            const slug = req.query.slug as string;
            const reaction = req.query.reaction as string;
            if (!slug || !reaction) {
                res.status(400).json({ message: 'Mangler slug eller reaksjon.' });
                return;
            }

            try {
                const { data, status } = await axios.post(`${BACKEND_URL}/reaction/${slug}/${reaction}`, {
                    headers: {
                        Authorization: `Bearer ${JWT_TOKEN}`,
                    },
                    validateStatus: (statusCode: number) => statusCode < 500,
                });

                if (status === 200) {
                    res.status(200).json(reactionDecoder(data));
                    return;
                }

                res.status(401).json({ message: 'Du har ikke tilgang til å reagere.' });
            } catch {
                res.status(500).json({ message: 'Noe gikk galt. Prøv igjen senere.' });
                return;
            }
        }
    }

    res.status(401).json({ message: 'Du har ikke tilgang til denne siden.' });
};

export default handler;
