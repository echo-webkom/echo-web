import axios from "axios";
import { responseDecoder } from "./decoders";
import { Response } from "./types";

interface FormValues {
    email: string;
    name: string;
    message: string;
}

const errorResponse = {
    title: 'Det har skjedd en feil.',
    desc: 'Vennligst prøv igjen',
    date: null,
};


const FeedbackAPI = {
    sendFeedback: async (
        values: FeedbackForm,
        backendUrl: string,
    ): Promise<{ response: Response; statusCode: number}> => {
        try {
            const { data, status } = await axios.post(`${backendUrl}/feedback`, values, {
                headers: { 'Content-Type': 'application/json' },
                validateStatus: (statusCode: number) => {
                    return statusCode < 500;
                }
            });

            return {
                response: responseDecoder(data),
                statusCode: status,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    return {
                        response: { ...errorResponse, code: 'InternalServerError' },
                        statusCode: error.response.status,
                    };
                }
                if (error.request) {
                    return {
                        response: { ...errorResponse, code: 'NoResponseError' },
                        statusCode: 500,
                    };
                }
            }

            return {
                response: { ...errorResponse, code: 'RequestError' },
                statusCode: 500,
            };
        }
    }
}

export { FeedbackAPI };
export type { FormValues };

