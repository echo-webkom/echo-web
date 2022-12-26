import { Box, Center, Flex, LinkBox, LinkOverlay, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import type { Happening } from '@api/happening';
import type { RegistrationCount } from '@api/registration';
import HappeningKeyInfo from '@components/happening-key-info';
import ReactionCount from '@components/reaction-count';

interface Props {
    event: Happening;
    registrationCounts?: Array<RegistrationCount>;
}

const EventPreview = ({ event, registrationCounts }: Props): JSX.Element => {
    return (
        <LinkBox data-testid={event.slug} position="relative">
            <Flex minH="2em" align="center" justifyContent="space-between" _hover={{ cursor: 'pointer' }}>
                <Box flexBasis="60%">
                    <NextLink href={`/event/${event.slug}`} passHref>
                        <LinkOverlay _hover={{ textDecorationLine: 'underline' }}>
                            <Text ml="3" my="2" position="relative">
                                {event.title}
                            </Text>
                            <ReactionCount slug={event.slug} position="absolute" left="3" bottom="-3" />
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
