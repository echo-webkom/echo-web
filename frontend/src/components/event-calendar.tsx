import type { IconProps } from '@chakra-ui/react';
import {
    Button,
    Divider,
    Text,
    Flex,
    Heading,
    HStack,
    Icon,
    SimpleGrid,
    Spacer,
    Stack,
    useColorModeValue,
    useBreakpointValue,
} from '@chakra-ui/react';
import { getISOWeek, subWeeks, addWeeks, startOfWeek, lastDayOfWeek, getISOWeekYear } from 'date-fns';
import { useEffect, useState } from 'react';
import { BiLeftArrow, BiRightArrow } from 'react-icons/bi';
import HappeningCalendarBox from './happening-calendar-box';
import Section from './section';
import type { Happening } from '@api/happening';

interface Props {
    happenings: Array<Happening>;
}

const capitalize = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1);
};

const EventCalendar = ({ happenings }: Props) => {
    const [date, setDate] = useState<Date>(new Date());
    const [datesInWeek, setDatesInWeek] = useState<Array<Date>>([]);

    const daysAtaTime = useBreakpointValue({
        base: 1,
        md: 7,
        // '2xl': 7,
    });

    const bedpresColor = useColorModeValue('highlight.light.primary', 'highlight.dark.primary');
    const otherColor = useColorModeValue('highlight.light.secondary', 'highlight.dark.secondary');

    useEffect(() => {
        const start = startOfWeek(date, { weekStartsOn: 1 });
        const end = lastDayOfWeek(date, { weekStartsOn: 1 });

        const dates = [];

        const current = new Date(start.getTime());
        while (current <= end) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        setDatesInWeek(dates);
    }, [date]);

    return (
        <>
            <Flex direction={['column', null, 'row']} mb="1rem">
                <Heading size="lg" marginBottom="1rem">
                    Uke {getISOWeek(date)} - {getISOWeekYear(date)}
                </Heading>
                <Spacer />
                <Flex justifyContent="center" gap="3">
                    <Button leftIcon={<BiLeftArrow />} onClick={() => setDate(subWeeks(date, 1))}>
                        Forrige uke
                    </Button>
                    <Button onClick={() => setDate(new Date())}>Idag</Button>
                    <Button rightIcon={<BiRightArrow />} onClick={() => setDate(addWeeks(date, 1))}>
                        Neste uke
                    </Button>
                </Flex>
            </Flex>

            <HStack alignItems="center" gap={5}>
                <Flex alignItems="inherit">
                    <CircleIcon color={bedpresColor} />
                    Bedpres
                </Flex>
                <Flex alignItems="inherit">
                    <CircleIcon color={otherColor} />
                    Annet
                </Flex>
            </HStack>
            <SimpleGrid as={Section} padding="1rem" columns={daysAtaTime} gridGap="1rem">
                {datesInWeek.map((date) => {
                    const formatDate = (date: Date): string => {
                        return date.toLocaleDateString('nb-NO', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                        });
                    };

                    return (
                        <Stack key={date.toISOString()}>
                            <Text
                                fontWeight="light"
                                fontSize="lg"
                                borderRadius="0.25rem"
                                bg={datesAreOnSameDay(date, new Date()) ? 'gray.700' : 'transparent'}
                                px="3"
                                py="1"
                            >
                                {datesAreOnSameDay(date, new Date()) ? 'Idag' : capitalize(formatDate(date))}
                            </Text>
                            <Divider />
                            {happenings.map((happening) => {
                                const happeningDate = new Date(happening.date);
                                if (datesAreOnSameDay(date, happeningDate)) {
                                    return (
                                        <HappeningCalendarBox
                                            key={happening.slug}
                                            type={happening.happeningType}
                                            title={happening.title}
                                            slug={happening.slug}
                                            location={happening.location}
                                            body={happening.body.no}
                                            author={happening.author}
                                        />
                                    );
                                }
                            })}
                        </Stack>
                    );
                })}
            </SimpleGrid>
        </>
    );
};

const datesAreOnSameDay = (first: Date, second: Date) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

const CircleIcon = (props: IconProps) => (
    <Icon viewBox="0 0 200 200" {...props}>
        <path fill="currentColor" d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0" />
    </Icon>
);

export default EventCalendar;
