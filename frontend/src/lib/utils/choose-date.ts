import { parseISO } from 'date-fns';

const chooseDate = (
    regDate: string | null,
    studentGroupRegDate: string | null,
    userIsEligibleForEarlyReg: boolean,
): Date => {
    if (!regDate && !studentGroupRegDate) return new Date();
    if (!regDate && studentGroupRegDate) return userIsEligibleForEarlyReg ? parseISO(studentGroupRegDate) : new Date();
    if (regDate && !studentGroupRegDate) return parseISO(regDate);
    if (regDate && studentGroupRegDate) return parseISO(userIsEligibleForEarlyReg ? studentGroupRegDate : regDate);
    // Shouldn't be possible to reach this point, but TypeScript doesn't know that
    return new Date();
};

export default chooseDate;
