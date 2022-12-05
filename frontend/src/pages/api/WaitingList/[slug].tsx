import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { slug } = req.query;

    if (slug === '') {
        res.status(400).json({ message: 'the slug given was an empty string' });
    }
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';
    await fetch(`${BACKEND_URL}/registration/promote/${slug}`, {
        method: 'POST',
    })
        .then((result) => {
            console.log(result.status);
            res.status(result.status);
            return;
        })
        .catch(() => {
            res.status(500);
            return;
        });
};

export default handler;
