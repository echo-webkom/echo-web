import { Button, Center, Text } from '@chakra-ui/react';
import type { ButtonProps } from '@chakra-ui/react';
import useCountdown from '@hooks/use-countdown';

interface Props extends ButtonProps {
    date: Date;
    children: JSX.Element | string;
}

const CountdownButton = ({ date, children, ...props }: Props): JSX.Element => {
    const { hours, minutes, seconds } = useCountdown(date);

    if (hours + minutes + seconds <= 0) {
        return <Button {...props}>{children}</Button>;
    }

    return (
        <Center data-testid="bedpres-not-open" my="3">
            <Text
                fontFamily="opensans"
                fontWeight="bold"
                fontSize={['5xl', null, null, '2xl', '3xl', '5xl']}
                textAlign="center"
            >
                {hours < 10 ? `0${hours}` : hours} : {minutes < 10 ? `0${minutes}` : minutes} :{' '}
                {seconds < 10 ? `0${seconds}` : seconds}
            </Text>
        </Center>
    );
};

export default CountdownButton;
