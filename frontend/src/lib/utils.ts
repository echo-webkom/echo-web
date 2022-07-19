const notEmptyOrNull = <E>(e: Array<E> | null) => e && e.length > 0;

const hasLongWord = (text: string): boolean =>
    text
        .split(' ')
        .map((word: string) => word.length > 18)
        .some(Boolean);

export { hasLongWord, notEmptyOrNull };
