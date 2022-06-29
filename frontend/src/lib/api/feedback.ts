/* eslint-disable @typescript-eslint/restrict-template-expressions */
import axios from 'axios';

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
    description: 'Vi kunne ikke sende tilbakemeldingen din. Prøv igjen senere.',
};

const BACKEND_URL = process.env.BACKEND_URL;

const FeedbackAPI = {
    sendFeedback: async (values: FormValues): Promise<FeedbackResponse> => {
        try {
            await axios.post(`${BACKEND_URL}/feedback`, values, {
                headers: { 'Content-Type': 'application/json' },
                validateStatus: (statusCode: number) => statusCode === 200,
            });

            return successResponse;
        } catch {
            return errorResponse;
        }
    },
};

export { FeedbackAPI };
export type { FormValues, FeedbackResponse };
