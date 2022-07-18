const hasLongWord = (text: string): boolean =>
    text
        .split(' ')
        .map((word: string) => word.length > 18)
        .some(Boolean);

export default hasLongWord;
