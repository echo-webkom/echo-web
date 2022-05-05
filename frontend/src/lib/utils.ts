const notEmptyOrNull = <E>(e: Array<E> | null) => e && e.length > 0;

export default notEmptyOrNull;
