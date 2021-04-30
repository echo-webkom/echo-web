import { Flex, Icon, LinkBox, LinkOverlay, Spacer, Text, useColorModeValue } from '@chakra-ui/react';
import { format } from 'date-fns';
import NextLink from 'next/link';
import React from 'react';
import { VscTriangleRight } from 'react-icons/vsc';
import { Event } from '../lib/api/event';
import theme from '../styles/theme';

const EventPreview = ({ event }: { event: Event }): JSX.Element => {
    const iconBg = useColorModeValue(theme.colors.teal[500], theme.colors.teal[200]);
    return (
        <LinkBox key={event.slug}>
            <Flex align="center" _hover={{ cursor: 'pointer' }}>
                <Icon as={VscTriangleRight} color={iconBg} />
                <NextLink href={`/events/${event.slug}`} passHref>
                    <LinkOverlay _hover={{ textDecorationLine: 'underline' }}>
                        <Text ml="3">{event.title}</Text>
                    </LinkOverlay>
                </NextLink>
                <Spacer mx="1" />
                <Text>{format(new Date(event.date), 'dd. MMM yyyy')}</Text>
            </Flex>
        </LinkBox>
    );
};

export default EventPreview;
