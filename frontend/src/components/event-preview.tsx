import { Box, Flex, LinkBox, LinkOverlay, Spacer } from '@chakra-ui/react';
import NextLink from 'next/link';
import type { Happening } from '@api/happening';
import type { RegistrationCount } from '@api/registration';
import HappeningKeyInfo from '@components/happening-key-info';

interface Props {
    event: Happening;
    registrationCounts?: Array<RegistrationCount>;
}

const EventPreview = ({ event, registrationCounts }: Props) => {
    return (
        <LinkBox data-testid={event.slug}>
            <Flex alignItems="center">
                <Box>
                    <LinkOverlay as={NextLink} href={`/event/${event.slug}`} _hover={{ textDecor: 'underline' }}>
                        {event.title}
                    </LinkOverlay>
                </Box>

                <Spacer />

                <Box>
                    <HappeningKeyInfo event={event} registrationCounts={registrationCounts} />
                </Box>
            </Flex>
        </LinkBox>
    );
};

export default EventPreview;
