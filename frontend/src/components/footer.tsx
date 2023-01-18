import {
    Icon,
    LinkBox,
    SimpleGrid,
    Text,
    useColorModeValue,
    Image,
    Center,
    Box,
    LinkOverlay,
    GridItem,
    VStack,
    HStack,
} from '@chakra-ui/react';
import { FaFacebook, FaGithub, FaInstagram } from 'react-icons/fa';
import { TbAlertOctagon } from 'react-icons/tb';
import LanguageMenu from '@components/language-menu';

const echoLogoWhite = '/echo-logo-text-only-white-no-padding-bottom.png';
const sanityLogo = '/sanity-logo.svg';
const vercelLogo = '/powered-by-vercel.svg';
const bekkLogo = '/bekk.png';

const Footer = () => {
    const color = useColorModeValue('highlight.light.primary', 'highlight.dark.primary');
    const textColor = useColorModeValue('button.light.text', 'button.dark.text');

    return (
        <Box bg="bg.dark.secondary" data-testid="footer">
            <SimpleGrid
                row={2}
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
                <GridItem colSpan={[1, 2, 4]} color="white" fontSize="md">
                    <VStack spacing="1em">
                        <LinkBox>
                            <LinkOverlay isExternal href="https://forms.gle/cRLRxpMap5AX1xx1A">
                                <VStack spacing="1em">
                                    <HStack spacing="1em">
                                        <Text textDecoration="underline">
                                            Har du opplevd noe som ikke føltes helt greit på lesesalen eller på et Echo
                                            arrangement?{' '}
                                        </Text>
                                        <Icon
                                            as={TbAlertOctagon}
                                            borderRadius="full"
                                            p="0.5"
                                            bg="red.400"
                                            color={textColor}
                                            _hover={{ bg: 'red.500', transform: 'scale(1)' }}
                                            boxSize={12}
                                            zIndex="100"
                                            height={6}
                                            width={6}
                                        />
                                    </HStack>
                                </VStack>
                            </LinkOverlay>
                        </LinkBox>
                        <LinkBox>
                            <LinkOverlay href="mailto:sandra.lekve@echo.uib.no">
                                <Text>
                                    Klikk over for å fylle ut skjemaet, eller klikk her for å sende en mail til lederen
                                    i Echo: sandra.lekve@echo.uib.no
                                </Text>
                            </LinkOverlay>
                        </LinkBox>
                    </VStack>
                </GridItem>

                <SimpleGrid columns={1} alignItems="center" rowGap="15px">
                    <Center>
                        <Image alt="echo" objectFit="contain" maxH="100px" src={echoLogoWhite} />
                    </Center>
                    <SimpleGrid columns={3} pt="0.5rem" spacing="3rem">
                        <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }} color={color}>
                            <LinkOverlay
                                href="https://facebook.com/groups/informatikk"
                                aria-label="Link til facebook"
                                isExternal
                            >
                                <Icon as={FaFacebook} w={10} h={10} />
                            </LinkOverlay>
                        </LinkBox>
                        <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }} color={color}>
                            <LinkOverlay
                                href="https://github.com/echo-webkom/echo-web"
                                aria-label="Link til GitHub"
                                isExternal
                            >
                                <Icon as={FaGithub} w={10} h={10} />
                            </LinkOverlay>
                        </LinkBox>
                        <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }} color={color}>
                            <LinkOverlay
                                href="https://instagram.com/echo_uib"
                                aria-label="Link til Instagram"
                                isExternal
                            >
                                <Icon as={FaInstagram} w={10} h={10} />
                            </LinkOverlay>
                        </LinkBox>
                    </SimpleGrid>
                </SimpleGrid>

                <SimpleGrid columns={[1, 1]} alignItems="center" rowGap="8px">
                    <Text fontSize="sm" color="white" m={0} textAlign="center" fontWeight="bold">
                        Hovedsamarbeidspartner
                    </Text>
                    <LinkBox m={0}>
                        <LinkOverlay href="https://bekk.no" aria-label="Link til Bekk" isExternal>
                            <Image alt="bekk" objectFit="contain" maxH="58px" src={bekkLogo} />
                        </LinkOverlay>
                    </LinkBox>
                </SimpleGrid>

                <SimpleGrid columns={[1, 1, 1]} alignItems="center">
                    <Text fontSize="sm" color="white" m={0} textAlign="center">
                        POWERED BY
                    </Text>
                    <LinkBox m={0}>
                        <LinkOverlay href="https://sanity.io" aria-label="Link til Sanity" isExternal>
                            <Image alt="sanity" width={175} height={52.5} src={sanityLogo} />
                        </LinkOverlay>
                    </LinkBox>
                    <LinkBox m={0}>
                        <LinkOverlay
                            href="https://vercel.com/?utm_source=echo-webkom&utm_campaign=oss"
                            aria-label="Link til Vercel"
                            isExternal
                        >
                            <Image alt="Powered by Vercel" width={175} height={52.5} src={vercelLogo} />
                        </LinkOverlay>
                    </LinkBox>
                </SimpleGrid>

                <SimpleGrid columns={1} maxWidth="400px" textAlign="center">
                    <LanguageMenu />
                    <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }}>
                        <LinkOverlay href="mailto:echo@uib.no" aria-label="Send mail til echo">
                            <Text fontSize="md" color={color}>
                                echo@uib.no
                            </Text>
                        </LinkOverlay>
                    </LinkBox>
                    <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }}>
                        <LinkOverlay href="https://goo.gl/maps/adUsBsoZh3QqNvA36" isExternal>
                            <Text fontSize="md" color={color}>
                                Thormøhlensgate 55
                            </Text>
                            <Text fontSize="md" color={color}>
                                5006 Bergen
                            </Text>
                        </LinkOverlay>
                    </LinkBox>
                    <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }}>
                        <LinkOverlay
                            href="https://w2.brreg.no/enhet/sok/detalj.jsp?orgnr=998995035"
                            aria-label="Link til brønnøysundregisteret"
                            isExternal
                        >
                            <Text fontSize="md" color={color}>
                                Org nr: 998 995 035
                            </Text>
                        </LinkOverlay>
                    </LinkBox>
                </SimpleGrid>
            </SimpleGrid>
        </Box>
    );
};

export default Footer;
