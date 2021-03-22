import React from 'react';
import NextLink from 'next/link';
import { Image, SimpleGrid, Text, LinkBox, LinkOverlay } from '@chakra-ui/react';

import { FiMail } from 'react-icons/fi';
import { FaFacebook, FaInstagram, FaGithub } from 'react-icons/fa';

const echoLogoWhite = '/echo-logo-text-only-white.png';

const Footer = (): JSX.Element => {
    const color = 'teal.400';

    return (
        <SimpleGrid
            columns={[1, 2, 3]}
            bg="bg2Dark"
            justifyItems="center"
            alignItems="center"
            spacingX="3em"
            spacingY="3em"
            w="100%"
            pt="2em"
            pb="2em"
            px="1em"
            mt="5em"
            bottom="0"
            pos="absolute"
            data-testid="footer-standard"
        >
            <SimpleGrid columns={2} spacing="3">
                <LinkBox
                    transition=".1s ease-out"
                    _hover={{ transform: 'scale(1.05)', cursor: 'pointer' }}
                    color={color}
                >
                    <NextLink href="https://facebook.com/groups/informatikk" passHref>
                        <LinkOverlay isExternal>
                            <FaFacebook size="4em" />
                        </LinkOverlay>
                    </NextLink>
                </LinkBox>
                <LinkBox
                    transition=".1s ease-out"
                    _hover={{ transform: 'scale(1.05)', cursor: 'pointer' }}
                    color={color}
                >
                    <NextLink href="https://github.com/echo-webkom/echo.uib.no" passHref>
                        <LinkOverlay isExternal>
                            <FaGithub size="4em" />
                        </LinkOverlay>
                    </NextLink>
                </LinkBox>
                <LinkBox
                    transition=".1s ease-out"
                    _hover={{ transform: 'scale(1.05)', cursor: 'pointer' }}
                    color={color}
                >
                    <NextLink href="mailto:echo@uib.no" passHref>
                        <LinkOverlay isExternal>
                            <FiMail size="4em" />
                        </LinkOverlay>
                    </NextLink>
                </LinkBox>
                <LinkBox
                    transition=".1s ease-out"
                    _hover={{ transform: 'scale(1.05)', cursor: 'pointer' }}
                    color={color}
                >
                    <NextLink href="https://instagram.com/echo_uib" passHref>
                        <LinkOverlay isExternal>
                            <FaInstagram size="4em" />
                        </LinkOverlay>
                    </NextLink>
                </LinkBox>
            </SimpleGrid>
            <Image
                alt="echo sin logo"
                display={['none', null, 'block']}
                htmlWidth="300px"
                fit="contain"
                src={echoLogoWhite}
            />
            <SimpleGrid columns={1} spacing="3" maxWidth="170px" textAlign="center">
                <LinkBox>
                    <NextLink href="mailto:echo@uib.no" passHref>
                        <LinkOverlay isExternal>
                            <Text color={color}>echo(at)uib.no</Text>
                        </LinkOverlay>
                    </NextLink>
                </LinkBox>
                <Text color={color}>Thormøhlensgate 55</Text>
                <Text color={color}>5006 Bergen</Text>
                <Text color={color}>Org nr: 998 995 035</Text>
            </SimpleGrid>
        </SimpleGrid>
    );
};

export default Footer;
