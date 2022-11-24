import { Center, Text } from '@chakra-ui/react';

interface Props {
    hours: number;
    minutes: number;
    seconds: number;
}

const Countdown = ({ hours, minutes, seconds }: Props): JSX.Element => (
    <Center data-testid="bedpres-not-open" my="3">
        <Text
            fontFamily="Open Sans"
            fontWeight="bold"
            fontSize={['5xl', null, null, '2xl', '3xl', '5xl']}
            textAlign="center"
        >
            {hours < 10 ? `0${hours}` : hours} : {minutes < 10 ? `0${minutes}` : minutes} :{' '}
            {seconds < 10 ? `0${seconds}` : seconds}
        </Text>
    </Center>
);

export default Countdown;
