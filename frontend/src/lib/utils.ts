const notEmptyOrNull = <E>(e: Array<E> | null) => e && e.length > 0;

const hasLongWord = (text: string): boolean =>
    text
        .split(' ')
        .map((word: string) => word.length > 18)
        .some(Boolean);

const fullNameToSplitName = (name: string) => {
    const [firstName, ...lastNameArray] = name.split(' ');

    return [firstName, lastNameArray.join(' ')];
};

export { hasLongWord, fullNameToSplitName, notEmptyOrNull };
