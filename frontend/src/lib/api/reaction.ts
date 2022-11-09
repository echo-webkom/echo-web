import axios from 'axios';
import type { decodeType } from 'typescript-json-decoder';
import { literal, union, number, record } from 'typescript-json-decoder';
import { type ErrorMessage } from '@utils/error';

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
            const { data, status } = await axios.get(`/api/reaction`, {
                params: { slug },
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
    post: async (slug: string, reaction: ReactionType): Promise<Reaction | ErrorMessage> => {
        try {
            const { data, status } = await axios.put(`/api/reaction`, null, {
                params: { slug, reaction },
                headers: {
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
