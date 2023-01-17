import { Box, Spacer, useColorModeValue, Text, Flex, LinkBox, LinkOverlay } from '@chakra-ui/react';
import Image from 'next/image';
import NextLink from 'next/link';
import HappeningKeyInfo from '@components/happening-key-info';
import type { Happening } from '@api/happening';
import type { RegistrationCount } from '@api/registration';
import ReactionCount from '@components/reaction-count';

interface Props {
    bedpres: Happening;
    registrationCounts?: Array<RegistrationCount>;
}

const BedpresPreview = ({ bedpres, registrationCounts }: Props): JSX.Element => {
    const hoverColor = useColorModeValue('bg.light.hover', 'bg.dark.hover');
    // logoUrl must always be defined in a Happening of type 'BEDPRES'.
    const logoUrl = bedpres.logoUrl as string;

    return (
        <LinkBox data-testid={bedpres.slug}>
            <Flex alignItems="center" p={[0, null, null, null, 5]} _hover={{ bg: hoverColor }}>
                <Flex alignItems="center" gap="5">
                    <Box display={['none', 'block']}>
                        <Box>
                            <Image
                                style={{ borderRadius: '100%' }}
                                src={logoUrl}
                                alt={bedpres.title}
                                width={85}
                                height={85}
                            />
                        </Box>
                    </Box>
                    <Box>
                        <Text fontWeight="regular" fontSize="larger">
                            <LinkOverlay as={NextLink} href={`/event/${bedpres.slug}`}>
                                {bedpres.title}
                            </LinkOverlay>
                        </Text>
                        <ReactionCount slug={bedpres.slug} />
                    </Box>
                </Flex>

                <Spacer />

                <Box minW="fit-content">
                    <HappeningKeyInfo event={bedpres} registrationCounts={registrationCounts} />
                </Box>
            </Flex>
        </LinkBox>
    );
};

export default BedpresPreview;
