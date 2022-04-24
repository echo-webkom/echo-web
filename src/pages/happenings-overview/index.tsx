import React, { useState } from 'react';
import { Box, Button, Heading, LinkBox, LinkOverlay, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { addWeeks, getISOWeek, lastDayOfWeek, startOfWeek, subWeeks } from 'date-fns';
import { GetStaticProps } from 'next';
import { BiLeftArrow, BiRightArrow } from 'react-icons/bi';
import SEO from '../../components/seo';
import { isErrorMessage, Happening, HappeningAPI, HappeningType } from '../../lib/api';

interface EventsStackProps {
    events: Array<Happening>;
    date: Date;
}

const datesAreOnSameDay = (first: Date, second: Date) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

const HappeningsColumn = ({ events, date }: EventsStackProps): React.ReactElement => {
    const eventsThisDay = events.filter((x) => datesAreOnSameDay(new Date(x.date), date));
    const formattedDate = date.toLocaleDateString('nb-NO', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <Stack>
            <Text fontWeight={'bold'} fontSize={'0.9em'}>
                {formattedDate}
            </Text>
            {eventsThisDay.map((event) => {
                return (
                    <LinkBox key={event.slug}>
                        <NextLink href={`/event/${event.slug}`} passHref>
                            <LinkOverlay _hover={{ textDecorationLine: 'underline' }}>
                                <Box>
                                    <Text marginBottom="1rem" fontSize={'0.8em'}>
                                        {event.title}
                                    </Text>
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

interface Props {
    events: Array<Happening>;
}
const HappeningsOverviewPage = ({ events }: Props): JSX.Element => {
    const [date, setDate] = useState(new Date());
    const currentWeek = getWeekDatesFromDate(date);

    return (
        <>
            <SEO title="Arrangementer" />
            <Heading marginBottom={'1rem'}>Arrangementer uke {getISOWeek(date)}</Heading>
            <Button
                leftIcon={<BiLeftArrow />}
                onClick={() => setDate(subWeeks(date, 1))}
                marginRight="1rem"
                size={'xs'}
            >
                forrige uke
            </Button>
            <Button rightIcon={<BiRightArrow />} onClick={() => setDate(addWeeks(date, 1))} size={'xs'}>
                neste uke
            </Button>
            <SimpleGrid padding={'1rem'} columns={[1, 2, 3, 7]} gridGap={'1rem'}>
                {currentWeek.map((x) => {
                    return <HappeningsColumn key={x.toString()} date={x} events={events} />;
                })}
            </SimpleGrid>
        </>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const eventsResponse = await HappeningAPI.getHappeningsByType(0, HappeningType.EVENT);
    const bedpressesResponse = await HappeningAPI.getHappeningsByType(0, HappeningType.BEDPRES);

    if (isErrorMessage(eventsResponse)) throw new Error(eventsResponse.message);
    if (isErrorMessage(bedpressesResponse)) throw new Error(bedpressesResponse.message);

    const props: Props = {
        events: [...eventsResponse, ...bedpressesResponse],
    };

    return { props };
};

export default HappeningsOverviewPage;
