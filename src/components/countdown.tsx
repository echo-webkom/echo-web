import React from 'react';
import { Text } from '@chakra-ui/react';
import { useCountdown } from '../lib/hooks';

const Countdown = ({ date }: { date: Date }) => {
    const { hours, minutes, seconds } = useCountdown(date);

    return (
        <Text fontWeight="bold" fontSize="5xl">
            {hours < 10 ? `0${hours}` : hours} : {minutes < 10 ? `0${minutes}` : minutes} :{' '}
            {seconds < 10 ? `0${seconds}` : seconds}
        </Text>
    );
};

export default Countdown;
