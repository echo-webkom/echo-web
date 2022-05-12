import { Box, HStack, LinkBox, LinkOverlay, Spacer, useColorModeValue, Heading } from '@chakra-ui/react';
import Image from 'next/image';
import NextLink from 'next/link';
import React from 'react';
import { Happening, RegistrationCount } from '../lib/api';
import HappeningKeyInfo from './happening-key-info';

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
            <HStack
                alignItems="center"
                border="2px"
                borderColor="transparent"
                p={[0, null, null, null, 5]}
                _hover={{ bg: hoverColor }}
            >
                <Box>
                    {/** Parent box is required to prevent child box from scaling inconsistently */}
                    <Box pos="relative" overflow="hidden" borderRadius="50%" w="85px" h="85px">
                        <Image src={logoUrl} alt={bedpres.title} layout="fill" objectFit="fill" />
                    </Box>
                </Box>
                <NextLink href={`/event/${bedpres.slug}`} passHref>
                    <LinkOverlay>
                        <Heading ml="2" display={['none', 'block']} fontWeight="regular" fontSize="larger">
                            {bedpres.title}
                        </Heading>
                    </LinkOverlay>
                </NextLink>
                <Spacer />
                <Box minW="fit-content">
                    <HappeningKeyInfo event={bedpres} registrationCounts={registrationCounts} />
                </Box>
            </HStack>
        </LinkBox>
    );
};

export default BedpresPreview;
