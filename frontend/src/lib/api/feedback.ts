import axios from 'axios';
import { ErrorMessage, Feedback } from './types';

interface FormValues {
    email: string;
    name: string;
    message: string;
}

interface FeedbackResponse {
    isSuccess: boolean;
    title: string;
    description: string;
}

const successResponse: FeedbackResponse = {
    isSuccess: true,
    title: 'Tilbakemelding sendt',
    description: 'Tusen takk for din tilbakemelding!',
};

const errorResponse: FeedbackResponse = {
    isSuccess: false,
    title: 'Noe gikk galt',
    description: 'Det har skjedd en feil, og tilbakemeldingen din ble ikke sendt. Prøv igjen senere.',
};

const VERIFIED_EMAILS: Set<string> = new Set(['ole.m.johnsen@student.uib.no', 'andreas.bakseter@student.uib.no']);

const FeedbackAPI = {
    sendFeedback: async (backendUrl: string, data: FormValues): Promise<FeedbackResponse> => {
        try {
            await axios.post(`${backendUrl}/feedback`, data, {
                headers: { 'Content-Type': 'application/json' },
                validateStatus: (statusCode: number) => statusCode === 200,
            });

            return successResponse;
        } catch {
            return errorResponse;
        }
    },
    getFeedback: async (backendUrl: string, auth: string, email: string): Promise<Array<Feedback> | ErrorMessage> => {
        try {
            if (VERIFIED_EMAILS.has(email)) {
                const { data, status }: { data: Array<Feedback>; status: number } = await axios.get(
                    `${backendUrl}/feedback`,
                    {
                        headers: { 'Content-Type': 'application/json' },
                        auth: {
                            username: 'admin',
                            password: auth,
                        },
                        validateStatus: (statusCode: number) => statusCode === 200,
                    },
                );

                if (status === 404) {
                    return { message: 'Ingen tilbakemeldinger funent.' };
                }

                return data;
            }

            return {
                message: 'Du har ikke tilgang til denne funksjonen',
            };
        } catch {
            return {
                message: 'Det har skjedd en feil, og tilbakemeldingene kunne ikke bli hentet. Prøv igjen senere.',
            };
        }
    },
};

export { FeedbackAPI };
export type { FormValues, FeedbackResponse };
