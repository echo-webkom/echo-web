import { useState, useEffect } from 'react';
import { differenceInMilliseconds, intervalToDuration } from 'date-fns';

const useCountdown = (toDate: Date): Duration => {
    const initialDateInterval = { end: toDate, start: new Date() };
    const [dateInterval, setDateInterval] = useState(initialDateInterval); // state with current interval

    useEffect(() => {
        const interval = setInterval(() => {
            const ms = differenceInMilliseconds(dateInterval.end, dateInterval.start);
            if (ms < 0) {
                clearInterval(interval); // countdown has reached 0
            } else {
                setDateInterval({ end: toDate, start: new Date() });
            }
        }, 1000); // Interval repeats every second
        return () => {
            clearInterval(interval);
        };
    });

    return intervalToDuration(dateInterval);
};

export default useCountdown;
