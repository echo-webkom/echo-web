import { number, union, record, string, type decodeType, nil, boolean, array } from 'typescript-json-decoder';
import { type ErrorMessage, isErrorMessage } from '@utils/error';

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
            const { ok } = await fetch(`${BACKEND_URL}/feedback`, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' },
            });

            return ok ? successResponse : errorResponse;
        } catch {
            return errorResponse;
        }
    },
    getFeedback: async (idToken: string): Promise<Array<Feedback> | ErrorMessage> => {
        try {
            const response = await fetch(`${BACKEND_URL}/feedback`, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });

            const data = await response.json();

            if (isErrorMessage(data)) {
                return data;
            }

            return array(union(feedbackDecoder))(data);
        } catch {
            return {
                message: 'Noe gikk galt. Prøv igjen senere.',
            };
        }
    },

    updateFeedback: async (feedback: Feedback, idToken: string): Promise<string | ErrorMessage> => {
        try {
            const response = await fetch(`${BACKEND_URL}/feedback`, {
                method: 'PUT',
                body: JSON.stringify(feedback),
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
            });

            const data = await response.json();

            return string(data);
        } catch {
            return {
                message: 'Kunne ikke markere tilbakemeldingen som lest/ulest.',
            };
        }
    },

    deleteFeedback: async (id: number, idToken: string): Promise<string | ErrorMessage> => {
        try {
            const response = await fetch(`${BACKEND_URL}/feedback`, {
                method: 'DELETE',
                body: JSON.stringify({ id }),
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
            });

            const data = await response.json();

            if (response.status === 200) return string(data);

            return { message: data };
        } catch {
            return {
                message: 'Kunne ikke slette tilbakemeldingen.',
            };
        }
    },
};

export { FeedbackAPI, type FormValues as FeedbackFormValues, type FeedbackResponse, type Feedback, feedbackDecoder };
