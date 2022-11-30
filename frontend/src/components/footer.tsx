import { Icon, LinkBox, LinkOverlay, SimpleGrid, Text, useColorModeValue, Image, Center, Box } from '@chakra-ui/react';
import NextLink from 'next/link';
import { FaFacebook, FaGithub, FaInstagram } from 'react-icons/fa';
import LanguageMenu from '@components/language-menu';
const echoLogoWhite = '/echo-logo-text-only-white-no-padding-bottom.png';
const sanityLogo = '/sanity-logo.svg';
const vercelLogo = '/powered-by-vercel.svg';
const bekkLogo = '/bekk.png';

const Footer = (): JSX.Element => {
    const color = useColorModeValue('highlight.light.primary', 'highlight.dark.primary');

    return (
        <Box bg="bg.dark.secondary" data-testid="footer">
            <SimpleGrid
                columns={[1, 2, 4]}
                justifyItems="center"
                alignItems="center"
                spacingX="3em"
                spacingY="3em"
                py="2em"
                px="1em"
                maxW="1400px"
                mx="auto"
            >
                <SimpleGrid columns={1} alignItems="center" rowGap="15px">
                    <Center>
                        <Image alt="echo" objectFit="contain" maxH="100px" src={echoLogoWhite} />
                    </Center>
                    <SimpleGrid columns={3} pt="0.5rem" spacing="3rem">
                        <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }} color={color}>
                            <NextLink href="https://facebook.com/groups/informatikk" passHref>
                                <LinkOverlay isExternal aria-label="Link til Facebook">
                                    <Icon as={FaFacebook} w={10} h={10} />
                                </LinkOverlay>
                            </NextLink>
                        </LinkBox>
                        <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }} color={color}>
                            <NextLink href="https://github.com/echo-webkom/echo-web" passHref>
                                <LinkOverlay isExternal aria-label="Link til GitHub">
                                    <Icon as={FaGithub} w={10} h={10} />
                                </LinkOverlay>
                            </NextLink>
                        </LinkBox>
                        <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }} color={color}>
                            <NextLink href="https://instagram.com/echo_uib" passHref>
                                <LinkOverlay isExternal aria-label="Link til Instagram">
                                    <Icon as={FaInstagram} w={10} h={10} />
                                </LinkOverlay>
                            </NextLink>
                        </LinkBox>
                    </SimpleGrid>
                </SimpleGrid>

                <SimpleGrid columns={[1, 1]} alignItems="center" rowGap="8px">
                    <Text fontSize="sm" color="white" m={0} textAlign="center" fontWeight="bold">
                        Hovedsamarbeidspartner
                    </Text>
                    <LinkBox m={0}>
                        <NextLink href="https://bekk.no" passHref>
                            <LinkOverlay isExternal>
                                <Image alt="bekk" objectFit="contain" maxH="58px" src={bekkLogo} />
                            </LinkOverlay>
                        </NextLink>
                    </LinkBox>
                </SimpleGrid>

                <SimpleGrid columns={[1, 1, 1]} alignItems="center">
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
                    <LinkBox m={0}>
                        <NextLink href="https://vercel.com/?utm_source=echo-webkom&utm_campaign=oss" passHref>
                            <LinkOverlay isExternal>
                                <Image alt="Powered by Vercel" width={175} height={52.5} src={vercelLogo} />
                            </LinkOverlay>
                        </NextLink>
                    </LinkBox>
                </SimpleGrid>

                <SimpleGrid columns={1} maxWidth="400px" textAlign="center">
                    <LanguageMenu />
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
        </Box>
    );
};

export default Footer;
