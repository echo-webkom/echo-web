import { Text, Divider, Stack } from '@chakra-ui/react';
import { Happening } from '../lib/api/types';
import HappeningCalendarBox from './happening-calendar-box';

interface Props {
    events: Array<Happening>;
    date: Date;
}

const datesAreOnSameDay = (first: Date, second: Date) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

const HappeningsColumn = ({ events, date }: Props): JSX.Element => {
    const eventsThisDay = events.filter((x) => datesAreOnSameDay(new Date(x.date), date));
    const formattedDate = date.toLocaleDateString('nb-NO', { weekday: 'long', month: 'short', day: 'numeric' });

    return (
        <Stack>
            <Text fontWeight="bold" fontSize="0.9em">
                {formattedDate}
            </Text>
            <Divider />
            {eventsThisDay.map((event) => (
                <HappeningCalendarBox
                    key={event.slug}
                    type={event.happeningType}
                    title={event.title}
                    slug={event.slug}
                    location={event.location}
                    body={event.body}
                    author={event.author}
                />
            ))}
        </Stack>
    );
};

export default HappeningsColumn;
