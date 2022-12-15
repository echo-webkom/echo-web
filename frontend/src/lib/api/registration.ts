import type { decodeType } from 'typescript-json-decoder';
import { array, record, string, number, boolean, optional, union, nil } from 'typescript-json-decoder';
import type { HappeningType } from '@api/happening';
import { degreeDecoder, emptyArrayOnNilDecoder } from '@utils/decoders';
import { isErrorMessage } from '@utils/error';
import type { ErrorMessage } from '@utils/error';

const responseDecoder = record({
    code: string,
    title: string,
    desc: string,
    date: optional(union(string, nil)),
});
type Response = decodeType<typeof responseDecoder>;

const answerDecoder = record({
    question: string,
    answer: string,
});
type Answer = decodeType<typeof answerDecoder>;

const registrationDecoder = record({
    email: string,
    alternateEmail: union(string, nil),
    name: string,
    degree: degreeDecoder,
    degreeYear: number,
    slug: string,
    submitDate: string,
    waitList: boolean,
    answers: array(answerDecoder),
    memberships: (value) => emptyArrayOnNilDecoder(string, value),
});
type Registration = decodeType<typeof registrationDecoder>;

const registrationCountDecoder = record({
    slug: string,
    count: number,
    waitListCount: number,
});
type RegistrationCount = decodeType<typeof registrationCountDecoder>;

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
                response: responseDecoder(data),
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

            const data = await response.json();

            if (isErrorMessage(data)) {
                return data;
            }

            return array(registrationDecoder)(data);
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
    ): Promise<{ response: string | null; error: string | null }> => {
        try {
            const [paramSlug, paramEmail] = [encodeURIComponent(slug), encodeURIComponent(email)];

            const response = await fetch(`${BACKEND_URL}/registration/${paramSlug}/${paramEmail}`, {
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

            return array(registrationCountDecoder)(data);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return {
                message: JSON.stringify(error),
            };
        }
    },
    getUserIsRegistered: async (email: string, slug: string, idToken: string): Promise<boolean | ErrorMessage> => {
        try {
            const { status } = await fetch(`${BACKEND_URL}/user/registrations/${email}/${slug}`, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });
            console.log(status);

            return status === 200;
        } catch (error) {
            return { message: 'Error in getUserIsRegistered' };
        }
    },
};

export {
    RegistrationAPI,
    registrationDecoder,
    type FormValues as RegFormValues,
    type RegistrationCount,
    type Registration,
};
