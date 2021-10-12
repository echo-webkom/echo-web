import {
    Center,
    Flex,
    Icon,
    LinkBox,
    LinkOverlay,
    SimpleGrid,
    Text,
    useColorModeValue,
    VStack,
} from '@chakra-ui/react';
import Image from 'next/image';
import NextLink from 'next/link';
import React from 'react';
import { FaFacebook, FaGithub, FaInstagram } from 'react-icons/fa';
import { FiMail } from 'react-icons/fi';

const echoLogoWhite = '/echo-logo-text-only-white.png';
const sanityLogo = '/sanity-logo.svg';

const Footer = (): JSX.Element => {
    const color = useColorModeValue('highlight.light.primary', 'highlight.dark.primary');

    return (
        <SimpleGrid
            columns={[1, 2, 3]}
            bg="bg.dark.secondary"
            justifyItems="center"
            alignItems="center"
            spacingX="3em"
            spacingY="3em"
            w="100%"
            py="2em"
            px="1em"
            mt="5em"
            bottom="0"
            pos="absolute"
            data-testid="footer"
        >
            <SimpleGrid columns={2} spacing="3">
                <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }} color={color}>
                    <NextLink href="https://facebook.com/groups/informatikk" passHref>
                        <LinkOverlay isExternal>
                            <Icon as={FaFacebook} boxSize={20} />
                        </LinkOverlay>
                    </NextLink>
                </LinkBox>
                <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }} color={color}>
                    <NextLink href="https://github.com/echo-webkom/echo.uib.no" passHref>
                        <LinkOverlay isExternal>
                            <Icon as={FaGithub} boxSize={20} />
                        </LinkOverlay>
                    </NextLink>
                </LinkBox>
                <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }} color={color}>
                    <NextLink href="mailto:echo@uib.no" passHref>
                        <LinkOverlay isExternal>
                            <Icon as={FiMail} boxSize={20} />
                        </LinkOverlay>
                    </NextLink>
                </LinkBox>
                <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }} color={color}>
                    <NextLink href="https://instagram.com/echo_uib" passHref>
                        <LinkOverlay isExternal>
                            <Icon as={FaInstagram} boxSize={20} />
                        </LinkOverlay>
                    </NextLink>
                </LinkBox>
            </SimpleGrid>
            <Flex display={['none', null, 'block']}>
                <Image alt="echo" width={300} height={146} src={echoLogoWhite} />
            </Flex>
            <SimpleGrid columns={[1, null, null, null, 2]} spacing="10" alignItems="center">
                <VStack>
                    <Text color="white">POWERED BY</Text>
                    <LinkBox>
                        <NextLink href="https://sanity.io" passHref>
                            <LinkOverlay isExternal>
                                <Center>
                                    <Image alt="sanity" width={200} height={60} src={sanityLogo} />
                                </Center>
                            </LinkOverlay>
                        </NextLink>
                    </LinkBox>
                </VStack>
                <SimpleGrid columns={1} spacing="2" maxWidth="400px" textAlign="center">
                    <LinkBox>
                        <NextLink href="mailto:echo@uib.no" passHref>
                            <LinkOverlay isExternal>
                                <Text color={color}>echo(at)uib.no</Text>
                            </LinkOverlay>
                        </NextLink>
                    </LinkBox>
                    <LinkBox>
                        <NextLink href="https://goo.gl/maps/adUsBsoZh3QqNvA36" passHref>
                            <LinkOverlay isExternal>
                                <Text color={color}>Thormøhlensgate 55</Text>
                                <Text color={color}>5006 Bergen</Text>
                            </LinkOverlay>
                        </NextLink>
                    </LinkBox>
                    <LinkBox>
                        <NextLink href="tel:+47998995035" passHref>
                            <LinkOverlay isExternal>
                                <Text color={color}>Org nr: 998 995 035</Text>
                            </LinkOverlay>
                        </NextLink>
                    </LinkBox>
                </SimpleGrid>
            </SimpleGrid>
        </SimpleGrid>
    );
};

export default Footer;
