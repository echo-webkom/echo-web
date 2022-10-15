import {
    Button,
    Center,
    Divider,
    Flex,
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
import { useContext, useEffect, useState } from 'react';
import { BiLeftArrow, BiRightArrow } from 'react-icons/bi';
import HappeningCalendarBox from './happening-calendar-box';
import LanguageContext from 'language-context';
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
    const isNorwegian = useContext(LanguageContext);

    const bedpresColor = useColorModeValue('highlight.light.primary', 'highlight.dark.primary');
    const otherColor = useColorModeValue('highlight.light.secondary', 'highlight.dark.secondary');

    const interval =
        useBreakpointValue({
            base: 0,
            md: 2,
            xl: 6,
        }) ?? 6;

    const [date, setDate] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
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
                        {interval === 0
                            ? isNorwegian
                                ? 'Forrige dag'
                                : 'Previous day'
                            : interval === 2
                            ? isNorwegian
                                ? 'Forrige tre dager'
                                : 'Previous three days'
                            : isNorwegian
                            ? 'Forrige uke'
                            : 'Previous week'}
                    </Button>
                    <Button onClick={() => setDate(new Date())}>{isNorwegian ? 'Idag' : 'Today'}</Button>
                    <Button rightIcon={<BiRightArrow />} onClick={() => setDate(addDays(date, interval + 1))}>
                        {interval === 0
                            ? isNorwegian
                                ? 'Neste dag'
                                : 'Next day'
                            : interval === 2
                            ? isNorwegian
                                ? 'Neste tre dager'
                                : 'Next three days'
                            : isNorwegian
                            ? 'Neste uke'
                            : 'Next week'}
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
                {calendarDates.map((today) => {
                    return (
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
                            {today.happenings.length === 0 && interval === 0 && (
                                <Center>{isNorwegian ? 'Ingen arrangementer' : 'No events'}</Center>
                            )}
                        </Stack>
                    );
                })}
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
