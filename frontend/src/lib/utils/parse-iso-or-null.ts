import { parseISO } from 'date-fns';

const parseISOOrNull = (value: string | null) => {
    if (value === null || value === 'null') {
        return null;
    }

    return parseISO(value);
};

export default parseISOOrNull;
