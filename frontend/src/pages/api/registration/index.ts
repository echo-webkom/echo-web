import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import axios from 'axios';
import { array, string } from 'typescript-json-decoder';
import { registrationDecoder } from '@api/registration';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getToken({ req });

    if (session) {
        const JWT_TOKEN = session.idToken as string;
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';
        const slug = req.query.slug as string;

        if (!session.email || !session.name) {
            res.status(401).json({ message: 'Du må være logget inn for å se denne siden.' });
            return;
        }

        if (req.method === 'GET') {
            try {
                const { data, status } = await axios.get(`${BACKEND_URL}/registration/${slug}?json=y`, {
                    headers: {
                        Authorization: `Bearer ${JWT_TOKEN}`,
                    },
                    validateStatus: (statusCode: number) => statusCode < 500,
                });

                if (status === 200) {
                    res.status(200).json(array(registrationDecoder)(data));
                    return;
                }

                res.status(401).json({ message: JSON.stringify(data) });
                return;
            } catch {
                res.status(500).json({ message: 'Noe gikk galt. Prøv igjen senere.' });
                return;
            }
        }

        if (req.method === 'DELETE') {
            try {
                const email = req.query.email as string;
                const { data, status } = await axios.delete(`${BACKEND_URL}/registration/${slug}/${email}`, {
                    headers: {
                        Authorization: `Bearer ${JWT_TOKEN}`,
                    },
                    validateStatus: (statusCode: number) => statusCode < 500,
                });

                if (status === 200) {
                    res.status(200).json(string(data));
                    return;
                }

                res.status(401).json({ message: 'Du har ikke tilgang til denne siden.' });
                return;
            } catch {
                res.status(500).json({ message: 'Noe gikk galt. Prøv igjen senere.' });
                return;
            }
        }

        res.status(405).json({ message: 'Metode ikke tillatt.' });
    }

    res.status(401).json({ message: 'Du har ikke tilgang til denne siden.' });
};

export default handler;
