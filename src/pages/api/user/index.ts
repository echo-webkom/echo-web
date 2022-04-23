import type { NextApiRequest, NextApiResponse } from 'next';
import { Degree, User } from '../../../lib/api';

const handler = (req: NextApiRequest, res: NextApiResponse) => {
    const user: User = {
        email: 'truls@gmail.com',
        firstName: 'truls',
        lastName: 'jefferson',
        grade: 3,
        degree: Degree.DVIT,
        allergies: 'none',
    };
    res.status(200).json(user);
};

export default handler;
