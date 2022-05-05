import { Box, Center, Flex, Heading, LinkBox, LinkOverlay, Spacer, useColorModeValue } from '@chakra-ui/react';
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
            <Box
                display="block"
                border="2px"
                borderColor="transparent"
                p={[0, null, null, null, 5]}
                _hover={{ bg: hoverColor }}
            >
                <Flex verticalAlign="middle">
                    <Flex borderRadius="50%" overflow="hidden">
                        <Image src={logoUrl} width={96} height={96} alt={bedpres.title} />
                    </Flex>
                    <Center ml="2em">
                        <NextLink href={`/event/${bedpres.slug}`} passHref>
                            <LinkOverlay>
                                <Heading display={['none', 'block']} fontWeight="regular" size="lg">
                                    {bedpres.title}
                                </Heading>
                            </LinkOverlay>
                        </NextLink>
                    </Center>
                    <Spacer />
                    <Center>
                        <HappeningKeyInfo event={bedpres} registrationCounts={registrationCounts} />
                    </Center>
                </Flex>
            </Box>
        </LinkBox>
    );
};

export default BedpresPreview;
