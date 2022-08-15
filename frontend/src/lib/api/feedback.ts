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
    description: 'Det har skjedd en feil, og tilbakemeldingen din ble ikke sendt. Prøv igjen senere.',
};

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
};

export { FeedbackAPI };
export type { FormValues, FeedbackResponse };
