import { Box, LinkBox, LinkOverlay, Spacer, useColorModeValue, Heading, Flex } from '@chakra-ui/react';
import Image from 'next/image';
import NextLink from 'next/link';
import HappeningKeyInfo from '@components/happening-key-info';
import type { Happening } from '@api/happening';
import type { RegistrationCount } from '@api/registration';

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
            <Flex
                alignItems="center"
                border="2px"
                borderColor="transparent"
                p={[0, null, null, null, 5]}
                _hover={{ bg: hoverColor }}
            >
                <Box>
                    {/** Parent box is required to prevent child box from scaling inconsistently */}
                    <Box pos="relative" overflow="hidden" borderRadius="50%" w="85px" h="85px">
                        <Image src={logoUrl} alt={bedpres.title} fill />
                    </Box>
                </Box>
                <LinkOverlay href={`/event/${bedpres.slug}`} as={NextLink}>
                    <Heading ml="2" display={['none', 'block']} fontWeight="regular" fontSize="larger">
                        {bedpres.title}
                    </Heading>
                </LinkOverlay>
                <Spacer />
                <Box minW="fit-content">
                    <HappeningKeyInfo event={bedpres} registrationCounts={registrationCounts} />
                </Box>
            </Flex>
        </LinkBox>
    );
};

export default BedpresPreview;
