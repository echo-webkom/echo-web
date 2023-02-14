import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

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
                const params = new URLSearchParams({ download: 'y' }).toString();
                const response = await fetch(`${BACKEND_URL}/registration/${slug}?${params}`, {
                    headers: {
                        Authorization: `Bearer ${JWT_TOKEN}`,
                    },
                    redirect: 'follow',
                });

                const data = await response.text();

                res.setHeader('Content-Type', 'text/csv');
                res.setHeader(
                    'Content-Disposition',
                    `attachment; filename=paameldte-${slug.toLowerCase().replace(' ', '-')}.csv`,
                );

                res.status(200).send(data);
                return;
            } catch {
                res.status(500).json({ message: 'Noe gikk galt. Prøv igjen senere.' });
                return;
            }
        }

        if (req.method === 'DELETE') {
            try {
                const email = session.email;
                const dots = req.query.dots as string;

                const endpoint =
                    dots !== '0'
                        ? `${BACKEND_URL}/registration/${slug}/${email}?dots=${dots}`
                        : `${BACKEND_URL}/registration/${slug}/${email}`;

                const response = await fetch(endpoint, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${JWT_TOKEN}`,
                    },
                });

                if (response.ok) {
                    res.status(200);
                    return;
                }
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
