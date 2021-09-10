import { Center, Text } from '@chakra-ui/react';
import React from 'react';
import { useCountdown } from '../lib/hooks';

const Countdown = ({ date }: { date: Date }): JSX.Element => {
    const { hours, minutes, seconds } = useCountdown(date);

    return (
        <Center data-testid="bedpres-not-open" my="3">
            <Text fontWeight="bold" fontSize="5xl">
                {hours < 10 ? `0${hours}` : hours} : {minutes < 10 ? `0${minutes}` : minutes} :{' '}
                {seconds < 10 ? `0${seconds}` : seconds}
            </Text>
        </Center>
    );
};

export default Countdown;
