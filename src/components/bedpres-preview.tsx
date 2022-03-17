import { Box, Center, Flex, Heading, LinkBox, LinkOverlay, Spacer, Text, useColorModeValue } from '@chakra-ui/react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import NextLink from 'next/link';
import Image from 'next/image';
import React from 'react';
import { Happening } from '../lib/api';

interface Props {
    bedpres: Happening;
}

const BedpresPreview = ({ bedpres }: Props): JSX.Element => {
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
                        <Text fontSize="1.25rem">{format(new Date(bedpres.date), 'dd. MMM yyyy', { locale: nb })}</Text>
                    </Center>
                </Flex>
            </Box>
        </LinkBox>
    );
};

export default BedpresPreview;
