import { z } from 'zod';
import { type ErrorMessage } from '@utils/error';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';

const reactionTypeSchema = z.enum(['LIKE', 'ROCKET', 'BEER', 'EYES', 'FIX']);
type ReactionType = z.infer<typeof reactionTypeSchema>;

const reactionSchema = z.object({
    like: z.number(),
    rocket: z.number(),
    beer: z.number(),
    eyes: z.number(),
    fix: z.number(),
    reactedTo: z.array(z.string()),
});
type Reaction = z.infer<typeof reactionSchema>;

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

            return reactionSchema.parse(data);
        } catch {
            return { message: 'Noe gikk galt. Prøv igjen senere.' };
        }
    },
    put: async (slug: string, reaction: ReactionType, idToken: string): Promise<Reaction | ErrorMessage> => {
        try {
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
                return reactionSchema.parse(data);
            }

            return data as ErrorMessage;
        } catch {
            return { message: 'Noe gikk galt. Prøv igjen senere.' };
        }
    },
};

export default ReactionAPI;
export { type ReactionType, type Reaction, reactionSchema };
