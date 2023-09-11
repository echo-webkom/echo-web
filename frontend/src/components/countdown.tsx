import { Center, Flex, Text } from '@chakra-ui/react';
import useCountdown from '@hooks/use-countdown-alt';

interface Props {
    title: string;
    endAt: Date;
}

const Countdown = ({ title, endAt }: Props) => {
    const [days, hours, minutes, seconds] = useCountdown(endAt);

    return (
        <Center textColor="white" flexDir="column" gap="1" bg="#18A0B3" px="3" py="2">
            <Text fontSize="md">{title}</Text>

            <Flex flexDir="row" gap="3" alignItems="center">
                <Text fontSize="2xl" transform="scale(-1, 1)">
                    🎉
                </Text>

                <Flex justifyContent="space-between" gap="2">
                    <Text
                        fontSize="md"
                        fontWeight="bold"
                        _after={{
                            content: ['" d."', '" dager"'],
                        }}
                    >
                        <Text as="span" fontFamily="mono" suppressHydrationWarning>
                            {days}
                        </Text>
                    </Text>
                    <Text
                        fontSize="md"
                        fontWeight="bold"
                        _after={{
                            content: ['" t."', '" timer"'],
                        }}
                    >
                        <Text as="span" fontFamily="mono" suppressHydrationWarning>
                            {hours}
                        </Text>
                    </Text>
                    <Text
                        fontSize="md"
                        fontWeight="bold"
                        _after={{
                            content: ['" m."', '" minutter"'],
                        }}
                    >
                        <Text as="span" fontFamily="mono" suppressHydrationWarning>
                            {minutes}
                        </Text>
                    </Text>
                    <Text
                        fontSize="md"
                        fontWeight="bold"
                        _after={{
                            content: ['" s."', '" sekunder"'],
                        }}
                    >
                        <Text as="span" fontFamily="mono" suppressHydrationWarning>
                            {seconds}
                        </Text>
                    </Text>
                </Flex>

                <Text fontSize="2xl">🎉</Text>
            </Flex>
        </Center>
    );
};

export default Countdown;
