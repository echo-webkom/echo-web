import {
    Box,
    Divider,
    Flex,
    Heading,
    HStack,
    Icon,
    IconProps,
    LinkBox,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverHeader,
    PopoverTrigger,
    SimpleGrid,
    Spacer,
    Stack,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
import { addWeeks, getISOWeek, lastDayOfWeek, startOfWeek, subWeeks } from 'date-fns';
import Markdown from 'markdown-to-jsx';
import { GetStaticProps } from 'next';
import NextLink from 'next/link';
import React, { useState } from 'react';
import { BiLeftArrow, BiRightArrow } from 'react-icons/bi';
import Button from '../../components/button';
import Section from '../../components/section';
import SEO from '../../components/seo';
import { Happening, HappeningAPI, HappeningType, isErrorMessage } from '../../lib/api';

interface EventsStackProps {
    events: Array<Happening>;
    date: Date;
}

interface HappeningBoxProps {
    type: HappeningType;
    title: string;
    slug: string;
    location: string;
    author: string;
    body: string;
}

const datesAreOnSameDay = (first: Date, second: Date) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

const HappeningBox = ({ type, title, slug, location, body, author }: HappeningBoxProps) => {
    const bedpresColor = useColorModeValue('highlight.light.primary', 'highlight.dark.primary');
    const otherColor = useColorModeValue('highlight.light.secondary', 'highlight.dark.secondary');
    return (
        <LinkBox
            bg={type === HappeningType.BEDPRES ? bedpresColor : otherColor}
            p="1"
            borderRadius="0.25rem"
            _hover={{ cursor: 'pointer' }}
        >
            <NextLink href={`/event/${slug}`}>
                <Popover trigger="hover">
                    <PopoverTrigger>
                        <Text noOfLines={1} color="black">
                            {title}
                        </Text>
                    </PopoverTrigger>
                    <PopoverContent>
                        <PopoverArrow />
                        <PopoverHeader>
                            {type === HappeningType.BEDPRES ? (
                                <Text as="em" fontWeight="bold" fontSize="sm">
                                    Bedpres
                                </Text>
                            ) : (
                                ''
                            )}
                            <Text fontWeight="extrabold">{title}</Text>
                        </PopoverHeader>
                        <PopoverBody>
                            <Text>@ {location}</Text>
                            <Divider />
                            <Text noOfLines={5}>
                                <Markdown>{body}</Markdown>
                            </Text>
                            <Text as="em" fontSize="sm">
                                {author}
                            </Text>
                        </PopoverBody>
                    </PopoverContent>
                </Popover>
            </NextLink>
        </LinkBox>
    );
};

const HappeningsColumn = ({ events, date }: EventsStackProps): React.ReactElement => {
    const eventsThisDay = events.filter((x) => datesAreOnSameDay(new Date(x.date), date));
    const formattedDate = date.toLocaleDateString('nb-NO', { weekday: 'long', month: 'short', day: 'numeric' });

    return (
        <Stack>
            <Text fontWeight="bold" fontSize="0.9em">
                {formattedDate}
            </Text>
            <Divider />
            {eventsThisDay.map((event) => (
                <HappeningBox
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

interface Props {
    events: Array<Happening>;
}
const HappeningsOverviewPage = ({ events }: Props): JSX.Element => {
    const [date, setDate] = useState(new Date());
    const currentWeek = getWeekDatesFromDate(date);
    const bedpresColor = useColorModeValue('highlight.light.primary', 'highlight.dark.primary');
    const otherColor = useColorModeValue('highlight.light.secondary', 'highlight.dark.secondary');

    return (
        <>
            <SEO title="Arrangementer" />
            <Flex direction={['column', null, 'row']} mb="1rem">
                <Heading size="lg" marginBottom="1rem">
                    Arrangementer uke {getISOWeek(date)}
                </Heading>
                <Spacer />
                <Flex justifyContent="center">
                    <Button leftIcon={<BiLeftArrow />} onClick={() => setDate(subWeeks(date, 1))} marginRight="1rem">
                        forrige uke
                    </Button>
                    <Button rightIcon={<BiRightArrow />} onClick={() => setDate(addWeeks(date, 1))}>
                        neste uke
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
