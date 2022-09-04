import axios from 'axios';
import type { ErrorMessage } from '@utils/error';

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

interface Feedback {
    id: number;
    email: string | null;
    name: string | null;
    message: string;
    sentAt: string;
    isRead: boolean;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';

const FeedbackAPI = {
    sendFeedback: async (data: FormValues): Promise<FeedbackResponse> => {
        try {
            await axios.post(`${BACKEND_URL}/feedback`, data, {
                headers: { 'Content-Type': 'application/json' },
                validateStatus: (statusCode: number) => statusCode === 200,
            });

            return successResponse;
        } catch {
            return errorResponse;
        }
    },
    getFeedback: async (): Promise<Array<Feedback> | ErrorMessage> => {
        try {
            const { data }: { data: Array<Feedback> | ErrorMessage } = await axios.get('/api/feedback', {
                headers: {
                    'Content-Type': 'application/json',
                },
                validateStatus: (status: number) => status < 500,
            });

            return data;
        } catch {
            return {
                message: 'Noe gikk galt. Prøv igjen senere.',
            };
        }
    },
    updateFeedback: async (id: number): Promise<string | ErrorMessage> => {
        try {
            const { data }: { data: string | ErrorMessage } = await axios.put('/api/feedback', {
                headers: { 'Content-Type': 'application/json' },
                data: id,
                validateStatus: (status: number) => status < 500,
            });

            return data;
        } catch {
            return {
                message: 'Kunne ikke markere tilbakemeldingen som lest/ulest.',
            };
        }
    },
    deleteFeedback: async (id: number): Promise<string | ErrorMessage> => {
        try {
            const { data }: { data: string | ErrorMessage } = await axios.delete('/api/feedback', {
                headers: { 'Content-Type': 'application/json' },
                data: id,
                validateStatus: (status: number) => status < 500,
            });

            return data;
        } catch {
            return {
                message: 'Kunne ikke slette tilbakemeldingen.',
            };
        }
    },
};

export { FeedbackAPI, type FormValues as FeedbackFormValues, type FeedbackResponse, type Feedback };
