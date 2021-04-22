import { useEffect, useRef } from 'react';

type TimeoutFunction = () => unknown | void;

const useTimeout = (callback: TimeoutFunction, delay: number | null): void => {
    const savedCallback = useRef<TimeoutFunction | null>(null);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        function tick() {
            if (savedCallback.current !== null) savedCallback.current();
        }

        if (delay !== null) {
            const id = setTimeout(tick, delay);
            return () => clearTimeout(id);
        }
        return undefined;
    }, [delay]);
};

export default useTimeout;
