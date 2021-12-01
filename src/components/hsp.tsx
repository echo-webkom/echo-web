import { Center, Heading, LinkBox, LinkOverlay, useBreakpointValue, useColorModeValue } from '@chakra-ui/react';
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
        <Section>
            <Center minW="0" wordBreak="break-word">
                <Heading mb=".5em" sizes={['xs', 'md']}>
                    {heading}
                </Heading>
            </Center>
            <Center>
                <LinkBox pb="16px">
                    <NextLink href="https://bekk.no" passHref>
                        <LinkOverlay isExternal filter={logoFilter}>
                            <Image alt="Bekk" src={bekkLogo} width={300} height={72} />
                        </LinkOverlay>
                    </NextLink>
                </LinkBox>
            </Center>
        </Section>
    );
};

export default Hsp;
