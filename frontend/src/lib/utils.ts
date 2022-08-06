import { JWT } from 'next-auth/jwt';
import { UserAPI, isErrorMessage } from './api';

const notEmptyOrNull = <E>(e: Array<E> | null) => e && e.length > 0;

const hasLongWord = (text: string): boolean =>
    text
        .split(' ')
        .map((word: string) => word.length > 18)
        .some(Boolean);

const getUserIfToken = async (token: JWT | null) => {
    if (token) {
        const user = await UserAPI.getUser();

        if (!isErrorMessage(user)) {
            return user;
        }
    }

    return null;
};

const fullNameToSplitName = (name: string) => {
    const [firstName, ...lastNameArray] = name.split(' ');

    return [firstName, lastNameArray.join(' ')];
};

export { hasLongWord, fullNameToSplitName, notEmptyOrNull, getUserIfToken };
