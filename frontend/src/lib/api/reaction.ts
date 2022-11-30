import axios from 'axios';
import type { decodeType } from 'typescript-json-decoder';
import { literal, union, number, record, array, string } from 'typescript-json-decoder';
import { type ErrorMessage } from '@utils/error';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';

const reactionTypeDecoder = union(literal('LIKE'), literal('ROCKET'), literal('BEER'), literal('EYES'), literal('FIX'));
type ReactionType = decodeType<typeof reactionTypeDecoder>;

const reactionDecoder = record({
    like: number,
    rocket: number,
    beer: number,
    eyes: number,
    fix: number,
    reactedTo: array(string),
});
type Reaction = decodeType<typeof reactionDecoder>;

const ReactionAPI = {
    get: async (slug: string, idToken: string | undefined): Promise<Reaction | ErrorMessage> => {
        try {
            if (!idToken) {
                return { message: 'No token.' };
            }

            const { data, status } = await axios.get(`${BACKEND_URL}/reaction/${slug}`, {
                params: { slug },
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
                validateStatus: (status: number) => status < 500,
            });

            if (status === 404) {
                return { message: 'Kunne ikke finne arrangementet.' };
            }

            if (status === 401) {
                return { message: 'Du må være logget inn for å se arrangementet.' };
            }

            return reactionDecoder(data);
        } catch {
            return { message: 'Noe gikk galt. Prøv igjen senere.' };
        }
    },
    post: async (
        slug: string,
        reaction: ReactionType,
        idToken: string | undefined,
    ): Promise<Reaction | ErrorMessage> => {
        try {
            if (!idToken) {
                return { message: 'No token.' };
            }

            const { data, status } = await axios.put(`${BACKEND_URL}/reaction`, null, {
                params: { slug, reaction },
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                },
                validateStatus: (status: number) => status < 500,
            });

            if (status === 200) {
                return reactionDecoder(data);
            }

            return data as ErrorMessage;
        } catch {
            return { message: 'Noe gikk galt. Prøv igjen senere.' };
        }
    },
};

export default ReactionAPI;
export { type ReactionType, type Reaction, reactionDecoder };
