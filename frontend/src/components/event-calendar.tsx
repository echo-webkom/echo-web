import {
    Button,
    Flex,
    Heading,
    HStack,
    Icon,
    IconProps,
    SimpleGrid,
    Spacer,
    useColorModeValue,
} from '@chakra-ui/react';
import { getISOWeek, subWeeks, addWeeks, startOfWeek, lastDayOfWeek } from 'date-fns';
import { useState } from 'react';
import { BiLeftArrow, BiRightArrow } from 'react-icons/bi';
import { Happening } from '../lib/api/types';
import HappeningsColumn from './happenings-column';
import Section from './section';

interface Props {
    events: Array<Happening>;
}

const EventCalendar = ({ events }: Props) => {
    const [date, setDate] = useState(new Date());
    const currentWeek = getWeekDatesFromDate(date);
    const bedpresColor = useColorModeValue('highlight.light.primary', 'highlight.dark.primary');
    const otherColor = useColorModeValue('highlight.light.secondary', 'highlight.dark.secondary');

    return (
        <>
            <Flex direction={['column', null, 'row']} mb="1rem">
                <Heading size="lg" marginBottom="1rem">
                    Uke {getISOWeek(date)}
                </Heading>
                <Spacer />
                <Flex justifyContent="center">
                    <Button leftIcon={<BiLeftArrow />} onClick={() => setDate(subWeeks(date, 1))} marginRight="1rem">
                        Forrige uke
                    </Button>
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
            <SimpleGrid as={Section} padding="1rem" columns={[1, 2, 3, 7]} gridGap="1rem">
                {currentWeek.map((x) => (
                    <HappeningsColumn key={x.toString()} date={x} events={events} />
                ))}
            </SimpleGrid>
        </>
    );
};

const getDatesInRange = (startDate: Date, endDate: Date): Array<Date> => {
    const date = new Date(startDate.getTime());

    const dates = [];

    while (date <= endDate) {
        dates.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }

    return dates;
};

const getWeekDatesFromDate = (date: Date): Array<Date> => {
    const firstWeekDay = startOfWeek(date, { weekStartsOn: 1 });
    const lastWeekDay = lastDayOfWeek(date, { weekStartsOn: 1 });
    return getDatesInRange(firstWeekDay, lastWeekDay);
};

const CircleIcon = (props: IconProps) => (
    <Icon viewBox="0 0 200 200" {...props}>
        <path fill="currentColor" d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0" />
    </Icon>
);

export default EventCalendar;
