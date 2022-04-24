import React, { useState } from 'react';
import { Box, Button, Heading, LinkBox, LinkOverlay, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { addWeeks, getISOWeek, lastDayOfWeek, startOfWeek, subWeeks } from 'date-fns';
import { GetStaticProps } from 'next';
import SEO from '../../components/seo';
import { isErrorMessage, Happening, HappeningAPI, HappeningType } from '../../lib/api';

interface Props {
    events: Array<Happening>;
}

interface EventsStackProps {
    events: Array<Happening>;
    date: Date;
}

const datesAreOnSameDay = (first: Date, second: Date) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

const EventsStack = ({ events, date }: EventsStackProps): React.ReactElement => {
    const eventsThisDay = events.filter((x) => datesAreOnSameDay(new Date(x.date), date));
    return (
        <Stack>
            <Text fontWeight={'bold'}>{date.toLocaleDateString()}</Text>
            {eventsThisDay.map((event) => {
                return (
                    <LinkBox key={event.slug}>
                        <NextLink href={`/event/${event.slug}`} passHref>
                            <LinkOverlay _hover={{ textDecorationLine: 'underline' }}>
                                <Box>
                                    <Text marginBottom="1rem">{event.title}</Text>
                                </Box>
                            </LinkOverlay>
                        </NextLink>
                    </LinkBox>
                );
            })}
        </Stack>
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

const EventsCollectionPage = ({ events }: Props): JSX.Element => {
    const [date, setDate] = useState(new Date());
    const currentWeek = getWeekDatesFromDate(date);

    return (
        <>
            <SEO title="Arrangementer" />
            <Heading marginBottom={'1rem'}>Arrangementer uke {getISOWeek(date)}</Heading>
            <Button onClick={() => setDate(subWeeks(date, 1))} marginRight="1rem">
                Forrige uke
            </Button>
            <Button onClick={() => setDate(addWeeks(date, 1))}>Neste uke</Button>
            <SimpleGrid padding={'1rem'} columns={7}>
                {currentWeek.map((x) => {
                    return <EventsStack key={x.toString()} date={x} events={events} />;
                })}
            </SimpleGrid>
        </>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const happenings = await HappeningAPI.getHappeningsByType(0, HappeningType.EVENT);

    if (isErrorMessage(happenings)) throw new Error(happenings.message);

    const props: Props = {
        events: happenings,
    };

    return { props };
};

export default EventsCollectionPage;
