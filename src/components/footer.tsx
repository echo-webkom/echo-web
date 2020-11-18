import React from 'react';
import { Link, Image, Box, SimpleGrid, Text, useColorModeValue } from '@chakra-ui/react';

import { FiMail } from 'react-icons/fi';
import { FaFacebook, FaInstagram, FaGithub } from 'react-icons/fa';

const echoLogoBlack = '/echo-logo-very-wide-text-only.png';
const echoLogoWhite = '/echo-logo-very-wide-text-only-white.png';

const Footer = (): JSX.Element => {
    const logo = useColorModeValue(echoLogoBlack, echoLogoWhite);
    const bg = useColorModeValue('gray.100', 'gray.900');
    const borderBg = useColorModeValue('mardiGras.400', 'naplesYellow.400');

    return (
        <SimpleGrid
            columns={[1, 2, 3]}
            justifyItems="center"
            alignItems="center"
            spacingX="3em"
            spacingY="3em"
            borderTopWidth="0.1em"
            borderTopColor={borderBg}
            bgColor={bg}
            w="100%"
            pt="4em"
            pb="2em"
            pl="1em"
            pr="1em"
            mt="5em"
            bottom="0"
            pos="absolute"
        >
            <SimpleGrid columns={2} spacing="3">
                <Link href="https://facebook.com/groups/informatikk" isExternal>
                    <Box
                        transition=".1s ease-out"
                        _hover={{ transform: 'scale(1.05)', cursor: 'pointer' }}
                        color={borderBg}
                    >
                        <FaFacebook size="4em" />
                    </Box>
                </Link>
                <Link href="https://github.com/echo-webkom/echo.uib.no" isExternal>
                    <Box
                        transition=".1s ease-out"
                        _hover={{ transform: 'scale(1.05)', cursor: 'pointer' }}
                        color={borderBg}
                    >
                        <FaGithub size="4em" />
                    </Box>
                </Link>
                <Link href="mailto:echo@uib.no" isExternal>
                    <Box
                        transition=".1s ease-out"
                        _hover={{ transform: 'scale(1.05)', cursor: 'pointer' }}
                        color={borderBg}
                    >
                        <FiMail size="4em" />
                    </Box>
                </Link>
                <Link href="https://instagram.com/echo_uib" isExternal>
                    <Box
                        transition=".1s ease-out"
                        _hover={{ transform: 'scale(1.05)', cursor: 'pointer' }}
                        color={borderBg}
                    >
                        <FaInstagram size="4em" />
                    </Box>
                </Link>
            </SimpleGrid>
            <Image display={['none', null, 'block']} htmlWidth="300px" fit="contain" src={logo} />
            <SimpleGrid columns={1} spacing="3" fontSize="lg" maxWidth="170px" textAlign="center">
                <Link href="mailto:echo.uib.no">
                    <Text color={borderBg}>echo@uib.no</Text>
                </Link>
                <Text color={borderBg}>Thormøhlensgate 55</Text>
                <Text color={borderBg}>5069 Bergen</Text>
                <Text color={borderBg}>Org nr: 000 000 000</Text>
            </SimpleGrid>
        </SimpleGrid>
    );
};

export default Footer;
