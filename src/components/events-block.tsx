import { Divider, Flex, LinkBox, LinkOverlay, Spacer, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import format from 'date-fns/format';
import { VscTriangleRight } from 'react-icons/vsc';
import NextLink from 'next/link';
import { Event } from '../lib/types';

import theme from '../styles/theme';

const EventsBlock = ({ events, error }: { events: Array<Event> | null; error: string | null }): JSX.Element => {
    const iconBg = useColorModeValue(theme.colors.teal[500], theme.colors.teal[200]);
    return (
        <>
            {events && !error && (
                <Stack pt=".5em" spacing="5" divider={<Divider />} fontSize={['lg', 'xl', '2xl']}>
                    {events.map((event: Event) => (
                        <LinkBox key={event.slug}>
                            <Flex align="center" _hover={{ cursor: 'pointer' }}>
                                <VscTriangleRight color={iconBg} />
                                <NextLink href={`/events/${event.slug}`} passHref>
                                    <LinkOverlay _hover={{ textDecorationLine: 'underline' }}>
                                        <Text ml="3">{event.title}</Text>
                                    </LinkOverlay>
                                </NextLink>
                                <Spacer mx="1" />
                                <Text>{format(new Date(event.date), 'dd. MMM yyyy')}</Text>
                            </Flex>
                        </LinkBox>
                    ))}
                </Stack>
            )}
        </>
    );
};

export default EventsBlock;
