import {
    Box,
    Center,
    Flex,
    Heading,
    LinkBox,
    LinkOverlay,
    useBreakpointValue,
    useColorModeValue,
} from '@chakra-ui/react';
import Image from 'next/image';
import NextLink from 'next/link';
import React from 'react';
import Section from './section';

const bekkLogo = '/bekk.png';

const Hsp = (): JSX.Element => {
    const logoFilter = useColorModeValue('invert(1)', 'invert(0)');
    const heading = useBreakpointValue([
        'HSP',
        'Vibe Partner',
        'Hovedsamarbeidspartner',
        'Vibe Partner',
        'Hovedsamarbeidspartner',
    ]);

    return (
        <Section h="100%">
            <Flex h="100%" direction="column" justifyContent="center" alignItems="center ">
                <Heading mb=".5em">{heading}</Heading>
                <Box flex="1">
                    <Center h="100%">
                        <LinkBox>
                            <NextLink href="https://bekk.no" passHref>
                                <LinkOverlay isExternal filter={logoFilter}>
                                    <Image alt="Bekk" src={bekkLogo} width={300} height={72} />
                                </LinkOverlay>
                            </NextLink>
                        </LinkBox>
                    </Center>
                </Box>
            </Flex>
        </Section>
    );
};

export default Hsp;
