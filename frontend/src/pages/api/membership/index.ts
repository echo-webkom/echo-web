import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import axios from 'axios';
import { type StudentGroup } from '@api/dashboard';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';

interface MembershipRequest {
    userEmail: string;
    studentGroups: Array<string>;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getToken({ req });

    if (session) {
        const JWT_TOKEN = session.idToken as string;

        if (req.method === 'PUT') {
            const { email, name } = session;

            const requsetBody: MembershipRequest = {
                userEmail: req.body.email as string,
                studentGroups: req.body.memberships as Array<StudentGroup>,
            };

            // not authenticated
            if (!email || !name) {
                res.status(401).end();
                return;
            }

            try {
                const { status } = await axios.put(`${BACKEND_URL}/membership`, requsetBody, {
                    headers: {
                        Authorization: `Bearer ${JWT_TOKEN}`,
                    },
                });

                res.status(status).end();
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
