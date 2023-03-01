import { z } from 'zod';
import type { HappeningType } from '@api/happening';
import { degreeSchema } from '@utils/schemas';
import { isErrorMessage } from '@utils/error';
import type { ErrorMessage } from '@utils/error';

const responseSchema = z.object({
    code: z.string(),
    title: z.string(),
    desc: z.string(),
    date: z.string().nullable().optional(),
});
type Response = z.infer<typeof responseSchema>;

const answerSchema = z.object({
    question: z.string(),
    answer: z.string(),
});
type Answer = z.infer<typeof answerSchema>;

const registrationSchema = z.object({
    email: z.string(),
    alternateEmail: z.string().nullable(),
    name: z.string(),
    degree: degreeSchema,
    degreeYear: z.number(),
    slug: z.string(),
    submitDate: z.string(),
    waitList: z.boolean(),
    answers: z.array(answerSchema),
    memberships: z
        .array(z.string())
        .nullable()
        .transform((m) => m ?? []),
});
type Registration = z.infer<typeof registrationSchema>;

const registrationCountSchema = z.object({
    slug: z.string(),
    count: z.number(),
    waitListCount: z.number(),
});
type RegistrationCount = z.infer<typeof registrationCountSchema>;

const genericError = {
    title: 'Det har skjedd en feil.',
    desc: 'Vennligst prøv igjen',
    date: null,
};

// Values directly from the form (aka form fields)
interface FormValues {
    email: string;
    answers: Array<string>;
}

// The data from the form + slug and type
interface FormRegistration {
    email: string;
    slug: string;
    type: HappeningType;
    answers: Array<Answer>;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';

const RegistrationAPI = {
    submitRegistration: async (
        registration: FormRegistration,
        idToken: string,
    ): Promise<{ response: Response; statusCode: number }> => {
        try {
            const response = await fetch(`${BACKEND_URL}/registration`, {
                method: 'POST',
                body: JSON.stringify(registration),
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
            });

            const data = await response.json();

            return {
                response: responseSchema.parse(data),
                statusCode: response.status,
            };
        } catch (error) {
            console.log(error); // eslint-disable-line
            return {
                response: { ...genericError, code: 'RequestError' },
                statusCode: 500,
            };
        }
    },

    getRegistrations: async (slug: string, idToken: string): Promise<Array<Registration> | ErrorMessage> => {
        try {
            const response = await fetch(`${BACKEND_URL}/registration/${slug}?json=y`, {
                headers: { Authorization: `Bearer ${idToken}` },
            });

            if (response.status === 404 || response.status === 403) {
                return [];
            }

            const data = await response.json();

            if (isErrorMessage(data)) {
                return data;
            }

            return registrationSchema.array().parse(data);
        } catch {
            return {
                message: 'Fail @ getRegistrations',
            };
        }
    },

    deleteRegistration: async (
        slug: string,
        email: string,
        idToken: string,
        strikes: number,
    ): Promise<{ response: string | null; error: string | null }> => {
        try {
            const [paramSlug, paramEmail] = [encodeURIComponent(slug), encodeURIComponent(email)];

            const response = await fetch(`${BACKEND_URL}/registration/${paramSlug}/${paramEmail}?strikes=${strikes}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${idToken}` },
            });

            const responseText = await response.text();

            if (response.status === 200) return { response: responseText, error: null };

            return { response: null, error: responseText };
        } catch (error) {
            console.log(error); // eslint-disable-line
            return { response: null, error: JSON.stringify(error) };
        }
    },

    getRegistrationCountForSlugs: async (
        slugs: Array<string>,
        auth: string,
    ): Promise<Array<RegistrationCount> | ErrorMessage> => {
        try {
            const response = await fetch(`${BACKEND_URL}/registration/count`, {
                method: 'POST',
                body: JSON.stringify({ slugs }),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${Buffer.from(`admin:${auth}`).toString('base64')}`,
                },
            });

            const data = await response.json();

            return registrationCountSchema.array().parse(data);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return {
                message: JSON.stringify(error),
            };
        }
    },

    getUserRegistrations: async (email: string, idToken: string): Promise<Array<string> | ErrorMessage> => {
        try {
            const encodedEmail = encodeURIComponent(email);
            const response = await fetch(`${BACKEND_URL}/user/registrations/${encodedEmail}`, {
                headers: { Authorization: `Bearer ${idToken}` },
            });

            if (response.status === 404 || response.status === 403) {
                return [];
            }

            const data = await response.json();

            if (isErrorMessage(data)) {
                return data;
            }

            // return registrationSchema.array().parse(data);
            return data;
        } catch {
            return {
                message: 'Fail @ getRegistrations',
            };
        }
    },
};

export {
    RegistrationAPI,
    registrationSchema,
    type FormValues as RegFormValues,
    type RegistrationCount,
    type Registration,
};
