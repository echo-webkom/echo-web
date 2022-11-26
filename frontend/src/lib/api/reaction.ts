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
    get: async (slug: string, idToken: string): Promise<Reaction | ErrorMessage> => {
        try {
            const params = new URLSearchParams({ slug }).toString();

            const response = await fetch(`${BACKEND_URL}/reaction/${slug}?${params}`, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });

            if (response.status === 404) {
                return { message: 'Kunne ikke finne arrangementet.' };
            }

            if (response.status === 401) {
                return { message: 'Du må være logget inn for å se arrangementet.' };
            }

            const data = await response.json();

            return reactionDecoder(data);
        } catch {
            return { message: 'Noe gikk galt. Prøv igjen senere.' };
        }
    },
    put: async (slug: string, reaction: ReactionType, idToken: string): Promise<Reaction | ErrorMessage> => {
        try {
            if (!idToken) {
                return { message: 'No token.' };
            }

            const params = new URLSearchParams({ slug, reaction }).toString();

            const response = await fetch(`${BACKEND_URL}/reaction?${params}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.status === 200) {
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
