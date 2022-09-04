import axios from 'axios';
import { number, union, record, string, type decodeType, nil, boolean, array } from 'typescript-json-decoder';
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

const feedbackDecoder = record({
    id: number,
    email: union(string, nil),
    name: union(string, nil),
    message: string,
    sentAt: string,
    isRead: boolean,
});

type Feedback = decodeType<typeof feedbackDecoder>;

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
            const { data } = await axios.get('/api/feedback', {
                headers: {
                    'Content-Type': 'application/json',
                },
                validateStatus: (status: number) => status < 500,
            });

            return array(union(feedbackDecoder))(data);
        } catch {
            return {
                message: 'Noe gikk galt. Prøv igjen senere.',
            };
        }
    },
    updateFeedback: async (feedback: Feedback): Promise<string | ErrorMessage> => {
        try {
            const { data } = await axios.put('/api/feedback', feedback, {
                headers: { 'Content-Type': 'application/json' },
                validateStatus: (status: number) => status < 500,
            });

            return string(data);
        } catch {
            return {
                message: 'Kunne ikke markere tilbakemeldingen som lest/ulest.',
            };
        }
    },
    deleteFeedback: async (id: number): Promise<string | ErrorMessage> => {
        try {
            const { data } = await axios.delete('/api/feedback', {
                headers: { 'Content-Type': 'application/json' },
                data: id,
                validateStatus: (status: number) => status < 500,
            });

            return string(data);
        } catch {
            return {
                message: 'Kunne ikke slette tilbakemeldingen.',
            };
        }
    },
};

export { FeedbackAPI, type FormValues as FeedbackFormValues, type FeedbackResponse, type Feedback, feedbackDecoder };
