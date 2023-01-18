const hasOverlap = <T>(a: Array<T> | undefined | null, b: Array<T> | undefined | null): boolean => {
    if (!a || !b) {
        return false;
    }

    return a.some((value) => b.includes(value));
};

export default hasOverlap;
