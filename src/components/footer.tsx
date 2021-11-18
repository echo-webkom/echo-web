import { Icon, LinkBox, LinkOverlay, SimpleGrid, Text, useColorModeValue } from '@chakra-ui/react';
import Image from 'next/image';
import NextLink from 'next/link';
import React from 'react';
import { FaFacebook, FaGithub, FaInstagram, FaCommentDots } from 'react-icons/fa';

const echoLogoWhite = '/echo-logo-text-only-white-no-padding-bottom.png';
const sanityLogo = '/sanity-logo.svg';

const Footer = (): JSX.Element => {
    const color = useColorModeValue('highlight.light.primary', 'highlight.dark.primary');

    return (
        <SimpleGrid
            columns={[1, 2, 4]}
            bg="bg.dark.secondary"
            justifyItems="center"
            alignItems="center"
            spacingX="3em"
            spacingY="3em"
            w="100%"
            py="1.25rem"
            px="1em"
            mt="2em"
            bottom="0"
            pos="absolute"
            data-testid="footer"
        >
            <SimpleGrid columns={[4, 4, 2, 4, 4]} spacing="4">
                <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }} color={color}>
                    <NextLink href="https://facebook.com/groups/informatikk" passHref>
                        <LinkOverlay isExternal>
                            <Icon as={FaFacebook} w={12} h={12} />
                        </LinkOverlay>
                    </NextLink>
                </LinkBox>
                <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }} color={color}>
                    <NextLink href="https://github.com/echo-webkom/echo.uib.no" passHref>
                        <LinkOverlay isExternal>
                            <Icon as={FaGithub} w={12} h={12} />
                        </LinkOverlay>
                    </NextLink>
                </LinkBox>
                <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }} color={color}>
                    <NextLink
                        href="https://docs.google.com/forms/d/e/1FAIpQLSey2XfQijRQNvoc8-y3DaufbPaN33SdRBrITrcq87s7DyG6pg/viewform"
                        passHref
                    >
                        <LinkOverlay isExternal>
                            <Icon as={FaCommentDots} w={12} h={12} />
                        </LinkOverlay>
                    </NextLink>
                </LinkBox>
                <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }} color={color}>
                    <NextLink href="https://instagram.com/echo_uib" passHref>
                        <LinkOverlay isExternal>
                            <Icon as={FaInstagram} w={12} h={12} />
                        </LinkOverlay>
                    </NextLink>
                </LinkBox>
            </SimpleGrid>
            <SimpleGrid columns={1} alignItems="center" display={['none', 'block', 'block']}>
                <Image alt="echo" width={145.15} height={65} src={echoLogoWhite} />
            </SimpleGrid>

            <SimpleGrid columns={1} alignItems="center">
                <Text fontSize="sm" color="white" m={0} textAlign="center">
                    POWERED BY
                </Text>
                <LinkBox m={0}>
                    <NextLink href="https://sanity.io" passHref>
                        <LinkOverlay isExternal>
                            <Image alt="sanity" width={175} height={52.5} src={sanityLogo} />
                        </LinkOverlay>
                    </NextLink>
                </LinkBox>
            </SimpleGrid>
            <SimpleGrid columns={1} maxWidth="400px" textAlign="center">
                <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }}>
                    <NextLink href="mailto:echo@uib.no" passHref>
                        <LinkOverlay isExternal>
                            <Text fontSize="md" color={color}>
                                echo@uib.no
                            </Text>
                        </LinkOverlay>
                    </NextLink>
                </LinkBox>
                <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }}>
                    <NextLink href="https://goo.gl/maps/adUsBsoZh3QqNvA36" passHref>
                        <LinkOverlay isExternal>
                            <Text fontSize="md" color={color}>
                                Thormøhlensgate 55
                            </Text>
                            <Text fontSize="md" color={color}>
                                5006 Bergen
                            </Text>
                        </LinkOverlay>
                    </NextLink>
                </LinkBox>
                <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }}>
                    <NextLink href="https://w2.brreg.no/enhet/sok/detalj.jsp?orgnr=998995035" passHref>
                        <LinkOverlay isExternal>
                            <Text fontSize="md" color={color}>
                                Org nr: 998 995 035
                            </Text>
                        </LinkOverlay>
                    </NextLink>
                </LinkBox>
            </SimpleGrid>
        </SimpleGrid>
    );
};

export default Footer;
