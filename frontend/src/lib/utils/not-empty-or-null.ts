const notEmptyOrNull = <E>(e: Array<E> | null | undefined): e is Array<E> =>
    e !== null && e !== undefined && e.length > 0;

export default notEmptyOrNull;
