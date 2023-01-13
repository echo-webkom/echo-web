import { Box, Flex, LinkBox, LinkOverlay, Spacer, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import type { Happening } from '@api/happening';
import type { RegistrationCount } from '@api/registration';
import HappeningKeyInfo from '@components/happening-key-info';
import ReactionCount from '@components/reaction-count';

interface Props {
    event: Happening;
    registrationCounts?: Array<RegistrationCount>;
}

const EventPreview = ({ event, registrationCounts }: Props) => {
    return (
        <LinkBox data-testid={event.slug}>
            <Flex alignItems="center">
                <Box>
                    <Text fontWeight="regular" fontSize="normal">
                        <LinkOverlay as={NextLink} href={`/event/${event.slug}`}>
                            {event.title}
                        </LinkOverlay>
                    </Text>
                    <ReactionCount slug={event.slug} />
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
