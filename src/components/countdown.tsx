import React from 'react';
import { Text } from '@chakra-ui/react';
import { format } from 'date-fns';
import { useCountdown } from '../lib/hooks';

const Countdown = ({ date }: { date: Date }): JSX.Element => {
    const { hours, minutes, seconds } = useCountdown(date);

    if (hours > 23) {
        return <Text fontSize="2xl">Åpner {format(date, 'dd. MMM yyyy, HH:mm')}</Text>;
    }

    return (
        <Text fontWeight="bold" fontSize="5xl">
            {hours < 10 ? `0${hours}` : hours} : {minutes < 10 ? `0${minutes}` : minutes} :{' '}
            {seconds < 10 ? `0${seconds}` : seconds}
        </Text>
    );
};

export default Countdown;
