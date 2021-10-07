import { Flex, Icon, LinkBox, LinkOverlay, Spacer, Text, useColorModeValue } from '@chakra-ui/react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import NextLink from 'next/link';
import React from 'react';
import { VscTriangleRight } from 'react-icons/vsc';
import { Event } from '../lib/api/event';

const EventPreview = ({ event }: { event: Event }): JSX.Element => {
    const iconBg = useColorModeValue('highlight.light.primary', 'highlight.dark.primary');
    return (
        <LinkBox data-testid={event.slug}>
            <Flex align="center" _hover={{ cursor: 'pointer' }}>
                <Icon as={VscTriangleRight} color={iconBg} />
                <NextLink href={`/events/${event.slug}`} passHref>
                    <LinkOverlay _hover={{ textDecorationLine: 'underline' }}>
                        <Text ml="3">{event.title}</Text>
                    </LinkOverlay>
                </NextLink>
                <Spacer mx="1" />
                <Text>{format(new Date(event.date), 'dd. MMM yyyy', { locale: nb })}</Text>
            </Flex>
        </LinkBox>
    );
};

export default EventPreview;
