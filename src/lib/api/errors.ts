const handleError = (code: number): string => {
    switch (code) {
        case 400:
            return 'Webkom klarer ikke skrive GraphQL.';
        case 401:
            return 'Webkom har ødelagt API-nøkkelen.';
        case 402:
            return 'Du har ikke echo premuim.';
        case 404:
            return '404: ikke funnet.';
        case 408:
            return 'Webkom skriver kode med O(n!) kompleksitet. (Eller så er APIen nede)';
        case 413:
        default:
            return 'Det var rart, vennligst kontakt Webkom så vi kan rette opp i dette.';
    }
};

export default handleError;
