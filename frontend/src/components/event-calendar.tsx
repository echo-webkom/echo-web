import {
    Button,
    Divider,
    Flex,
    GridItem,
    Heading,
    HStack,
    Icon,
    SimpleGrid,
    Spacer,
    Stack,
    Text,
    useBreakpointValue,
    useColorModeValue,
    type IconProps,
} from '@chakra-ui/react';
import { addDays, eachDayOfInterval, getISOWeek, getISOWeekYear, isSameDay, startOfWeek, subDays } from 'date-fns';
import { useEffect, useState } from 'react';
import { BiLeftArrow, BiRightArrow } from 'react-icons/bi';
import HappeningCalendarBox from '@components/happening-calendar-box';
import useLanguage from '@hooks/use-language';
import capitalize from '@utils/capitalize';
import type { Happening } from '@api/happening';

const formatDate = (isNorwegian: boolean, date: Date): string => {
    return date.toLocaleDateString(isNorwegian ? 'nb-NO' : 'en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    });
};

interface CalendarDay {
    date: Date;
    happenings: Array<Happening>;
}

interface Props {
    happenings: Array<Happening>;
}

const EventCalendar = ({ happenings }: Props) => {
    const isNorwegian = useLanguage();

    const bedpresColor = useColorModeValue('highlight.light.primary', 'highlight.dark.primary');
    const otherColor = useColorModeValue('highlight.light.secondary', 'highlight.dark.secondary');

    const interval =
        useBreakpointValue({
            base: 0,
            md: 2,
            '2xl': 6,
        }) ?? 6;

    const [date, setDate] = useState<Date>(new Date());
    const [calendarDates, setCalendarDates] = useState<Array<CalendarDay>>([]);

    useEffect(() => {
        const start =
            interval === 0 ? date : interval === 2 ? subDays(date, 1) : startOfWeek(date, { weekStartsOn: 1 });
        const intervalDates = eachDayOfInterval({
            start: start,
            end: addDays(start, interval),
        });
        setCalendarDates(
            intervalDates.map((date) => ({
                date,
                happenings: happenings.filter((happening) => isSameDay(date, new Date(happening.date))),
            })),
        );
    }, [date, happenings, interval]);

    return (
        <>
            <Flex direction={['column', null, null, null, 'row']} mb="1rem">
                <Heading size="lg" marginBottom="1rem">
                    {interval === 6 && `${isNorwegian ? 'Uke' : 'Week'} ${getISOWeek(date)} - ${getISOWeekYear(date)}`}
                </Heading>
                <Spacer />
                <Flex justifyContent="center" gap="3">
                    <Button leftIcon={<BiLeftArrow />} onClick={() => setDate(subDays(date, interval + 1))}>
                        {isNorwegian ? 'Forrige' : 'Previous'}
                    </Button>
                    <Button onClick={() => setDate(new Date())}>{isNorwegian ? 'Idag' : 'Today'}</Button>
                    <Button rightIcon={<BiRightArrow />} onClick={() => setDate(addDays(date, interval + 1))}>
                        {isNorwegian ? 'Neste' : 'Next'}
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

            <SimpleGrid padding="1rem" columns={interval + 1} gridGap="1rem">
                {calendarDates.map((today) => (
                    <Stack key={today.date.toISOString()}>
                        <Text fontWeight="light" fontSize="lg" borderRadius="0.25rem" px="3" py="1">
                            {isSameDay(today.date, new Date())
                                ? isNorwegian
                                    ? 'Idag'
                                    : 'Today'
                                : capitalize(formatDate(isNorwegian, today.date))}
                        </Text>
                        <Divider />
                        {today.happenings.map((happening) => (
                            <HappeningCalendarBox key={happening.slug} happening={happening} />
                        ))}
                    </Stack>
                ))}
                {calendarDates.every((day) => day.happenings.length === 0) && (
                    <GridItem colSpan={interval + 1}>
                        <Text textAlign="center" fontSize="2xl">
                            {isNorwegian ? 'Ingen arrangementer' : 'No events'}
                        </Text>
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
