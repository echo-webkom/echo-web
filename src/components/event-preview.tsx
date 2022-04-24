import { Box, Center, Flex, LinkBox, LinkOverlay, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import { Happening, RegistrationCount } from '../lib/api';
import HappeningKeyInfo from './happening-key-info';

interface Props {
    event: Happening;
    registrationCounts?: Array<RegistrationCount>;
}

const EventPreview = ({ event, registrationCounts }: Props): JSX.Element => {
    return (
        <LinkBox data-testid={event.slug}>
            <Flex align="center" justifyContent="space-between" _hover={{ cursor: 'pointer' }}>
                <Box flexBasis="60%">
                    <NextLink href={`/event/${event.slug}`} passHref>
                        <LinkOverlay _hover={{ textDecorationLine: 'underline' }}>
                            <Text ml="3">{event.title}</Text>
                        </LinkOverlay>
                    </NextLink>
                </Box>
                <Center>
                    <HappeningKeyInfo event={event} registrationCounts={registrationCounts} />
                </Center>
            </Flex>
        </LinkBox>
    );
};

export default EventPreview;
