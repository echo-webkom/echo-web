import { Box, Spacer, useColorModeValue, Text, Flex, LinkBox, LinkOverlay } from '@chakra-ui/react';
import Image from 'next/image';
import NextLink from 'next/link';
import HappeningKeyInfo from '@components/happening-key-info';
import type { Happening } from '@api/happening';
import type { RegistrationCount } from '@api/registration';

interface Props {
    bedpres: Happening;
    registrationCounts?: Array<RegistrationCount>;
}

const BedpresPreview = ({ bedpres, registrationCounts }: Props) => {
    const hoverColor = useColorModeValue('bg.light.hover', 'bg.dark.hover');

    const logoUrl = bedpres.logoUrl as string;

    return (
        <LinkBox data-testid={bedpres.slug}>
            <Flex alignItems="center" p={[0, null, null, null, 5]} _hover={{ bg: hoverColor }}>
                <Flex alignItems="center" gap="5">
                    <Box display={['none', 'block']}>
                        <Box pos="relative" overflow="hidden" borderRadius="50%" w="85px" h="85px">
                            <Image src={logoUrl} alt={bedpres.title} fill />
                        </Box>
                    </Box>
                    <Box>
                        <Text fontWeight="regular" fontSize="larger">
                            <LinkOverlay as={NextLink} href={`/event/${bedpres.slug}`}>
                                {bedpres.title}
                            </LinkOverlay>
                        </Text>
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
