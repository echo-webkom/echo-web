import { useState, useEffect } from 'react';
import { differenceInMilliseconds } from 'date-fns';

interface CountdownObject {
    hours: number;
    minutes: number;
    seconds: number;
}

const formatMs = (ms: number): CountdownObject => {
    return {
        hours: ms < 0 ? 0 : Math.floor(ms / (1000 * 3600)),
        minutes: ms < 0 ? 0 : Math.floor((ms / (1000 * 60)) % 60),
        seconds: ms < 0 ? 0 : Math.floor((ms / 1000) % 60),
    };
};

const useCountdown = (toDate: Date, now: Date): CountdownObject => {
    const initialMs = differenceInMilliseconds(toDate, now);
    const [ms, setMs] = useState(initialMs); // state with current interval

    useEffect(() => {
        const interval = setInterval(() => {
            if (ms < 0) {
                clearInterval(interval); // countdown has reached 0
            }
            setMs(ms - 1000);
        }, 1000); // Interval repeats every second

        return () => {
            clearInterval(interval);
        };
    });

    return formatMs(ms);
};

export default useCountdown;
