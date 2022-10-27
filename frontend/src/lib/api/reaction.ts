import axios from 'axios';
import type { decodeType } from 'typescript-json-decoder';
import { literal, union, number, record } from 'typescript-json-decoder';
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
});
type Reaction = decodeType<typeof reactionDecoder>;

const ReactionAPI = {
    get: async (slug: string): Promise<Reaction | ErrorMessage> => {
        try {
            const { data, status } = await axios.get(`${BACKEND_URL}/reaction/${slug}`, {
                validateStatus: (status: number) => status < 500,
            });

            if (status === 404) {
                return { message: 'Kunne ikke finne arrangementet.' };
            }

            return reactionDecoder(data);
        } catch {
            return { message: 'Noe gikk galt. Prøv igjen senere.' };
        }
    },
    post: async (slug: string, reaction: ReactionType): Promise<Reaction | ErrorMessage> => {
        try {
            const { data, status } = await axios.post(`/api/reaction`, { slug, reaction });

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
