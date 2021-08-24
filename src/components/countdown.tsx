import React from 'react';
import { Center, Text } from '@chakra-ui/react';
import { format, isFuture, isPast, parseISO } from 'date-fns';
import { useCountdown } from '../lib/hooks';
import { Bedpres } from '../lib/api/bedpres';
import BedpresForm from './bedpres-form';

const Countdown = ({ bedpres, backendUrl }: { bedpres: Bedpres; backendUrl: string }): JSX.Element => {
    const regDate = parseISO(bedpres?.registrationTime);
    const { hours, minutes, seconds } = useCountdown(regDate);

    if (isFuture(parseISO(bedpres.registrationTime))) {
        if (hours > 23) {
            return <Text fontSize="2xl">Åpner {format(regDate, 'dd. MMM yyyy, HH:mm')}</Text>;
        }
        return (
            <Center data-testid="bedpres-not-open" my="3">
                <Text fontWeight="bold" fontSize="5xl">
                    {hours < 10 ? `0${hours}` : hours} : {minutes < 10 ? `0${minutes}` : minutes} :{' '}
                    {seconds < 10 ? `0${seconds}` : seconds}
                </Text>
            </Center>
        );
    }

    if (isFuture(parseISO(bedpres.date)) && isPast(regDate)) {
        return (
            <BedpresForm
                slug={bedpres.slug}
                questions={bedpres.additionalQuestions}
                title={bedpres.title}
                backendUrl={backendUrl}
            />
        );
    }

    return (
        <Center my="3" data-testid="bedpres-has-been">
            <Text>Påmeldingen er stengt.</Text>
        </Center>
    );
};

export default Countdown;
