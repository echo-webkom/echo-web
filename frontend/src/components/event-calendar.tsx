import {
    Button,
    Divider,
    Text,
    Flex,
    Heading,
    HStack,
    Icon,
    SimpleGrid,
    GridItem,
    Center,
    Spacer,
    Stack,
    useColorModeValue,
    useBreakpointValue,
    type IconProps,
} from '@chakra-ui/react';
import { getISOWeek, subWeeks, addWeeks, startOfWeek, lastDayOfWeek, getISOWeekYear, isSameDay } from 'date-fns';
import { useContext, useEffect, useState } from 'react';
import { BiLeftArrow, BiRightArrow } from 'react-icons/bi';
import HappeningCalendarBox from './happening-calendar-box';
import Section from './section';
import type { Happening } from '@api/happening';
import LanguageContext from 'language-context';
import capitalize from '@utils/capitalize';

interface CalendarDay {
    date: Date;
    happenings: Array<Happening>;
}

interface Props {
    happenings: Array<Happening>;
}

const EventCalendar = ({ happenings }: Props) => {
    const isNorwegian = useContext(LanguageContext);

    const [date, setDate] = useState<Date>(new Date());
    const [calendarDays, setCalendarDays] = useState<Array<CalendarDay>>([]);

    const daysAtaTime = useBreakpointValue({
        base: 1,
        md: 3,
        '2xl': 7,
    });

    const bedpresColor = useColorModeValue('highlight.light.primary', 'highlight.dark.primary');
    const otherColor = useColorModeValue('highlight.light.secondary', 'highlight.dark.secondary');
    const todayHighlightColor = useColorModeValue('gray.100', 'gray.700');

    useEffect(() => {
        const start = startOfWeek(date, { weekStartsOn: 1 });
        const end = lastDayOfWeek(date, { weekStartsOn: 1 });

        const dates = [];

        const current = new Date(start.getTime());
        while (current <= end) {
            dates.push({
                date: new Date(current),
                happenings: happenings.filter((happening) => isSameDay(new Date(happening.date), current)),
            });

            current.setDate(current.getDate() + 1);
        }

        setCalendarDays(dates);
    }, [date, happenings]);

    return (
        <>
            <Flex direction={['column', null, 'row']} mb="1rem">
                <Heading size="lg" marginBottom="1rem">
                    {isNorwegian ? 'Uke' : 'Week'} {getISOWeek(date)} - {getISOWeekYear(date)}
                </Heading>
                <Spacer />
                <Flex justifyContent="center" gap="3">
                    <Button leftIcon={<BiLeftArrow />} onClick={() => setDate(subWeeks(date, 1))}>
                        {isNorwegian ? 'Forrige uke' : 'Previous week'}
                    </Button>
                    <Button onClick={() => setDate(new Date())}>{isNorwegian ? 'Idag' : 'Today'}</Button>
                    <Button rightIcon={<BiRightArrow />} onClick={() => setDate(addWeeks(date, 1))}>
                        {isNorwegian ? 'Neste uke' : 'Next week'}
                    </Button>
                </Flex>
            </Flex>

            <HStack alignItems="center" gap={5}>
                <Flex alignItems="inherit">
                    <CircleIcon color={bedpresColor} />
                    {isNorwegian ? 'Bedpres' : 'Compres'}
                </Flex>
                <Flex alignItems="inherit">
                    <CircleIcon color={otherColor} />
                    {isNorwegian ? 'Annet' : 'Other'}
                </Flex>
            </HStack>

            <SimpleGrid as={Section} padding="1rem" columns={daysAtaTime} gridGap="1rem">
                {calendarDays.map((today) => {
                    const formatDate = (date: Date): string => {
                        return date.toLocaleDateString(isNorwegian ? 'nb-NO' : 'en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                        });
                    };

                    return (
                        <Stack key={today.date.toISOString()}>
                            <Text
                                fontWeight="light"
                                fontSize="lg"
                                borderRadius="0.25rem"
                                bg={isSameDay(today.date, new Date()) ? todayHighlightColor : 'transparent'}
                                px="3"
                                py="1"
                            >
                                {isSameDay(today.date, new Date())
                                    ? isNorwegian
                                        ? 'Idag'
                                        : 'Today'
                                    : capitalize(formatDate(today.date))}
                            </Text>
                            <Divider />
                            {today.happenings.map((happening) => (
                                <HappeningCalendarBox key={happening.slug} happening={happening} />
                            ))}
                        </Stack>
                    );
                })}
                {calendarDays.every((day) => day.happenings.length === 0) && (
                    <GridItem colSpan={daysAtaTime}>
                        <Center>
                            <Text fontSize="4xl" fontWeight="extrabold" py="5">
                                {isNorwegian ? 'Ingen arrangementer denne uken' : 'No events this week'}
                            </Text>
                        </Center>
                    </GridItem>
                )}
            </SimpleGrid>
        </>
    );
};

const CircleIcon = (props: IconProps) => (
    <Icon viewBox="0 0 200 200" {...props}>
        <path fill="currentColor" d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0" />
    </Icon>
);

export default EventCalendar;
