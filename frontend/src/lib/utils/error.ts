interface ErrorMessage {
    message: string;
}

// https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
const isErrorMessage = (error: unknown): error is ErrorMessage => {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as Record<string, unknown>).message === 'string'
    );
};

const handleError = (code: number): string => {
    switch (code) {
        case 400: {
            return 'Webkom klarer ikke skrive GraphQL.';
        }
        case 401: {
            return 'Webkom har ødelagt API-nøkkelen.';
        }
        case 402: {
            return 'Du har ikke echo premium.';
        }
        case 408: {
            return 'Webkom skriver kode med O(n!) kompleksitet. (Eller så er APIen nede)';
        }
        default: {
            return 'Det var rart, vennligst kontakt Webkom så vi kan rette opp i dette.';
        }
    }
};

export { isErrorMessage, type ErrorMessage, handleError };
