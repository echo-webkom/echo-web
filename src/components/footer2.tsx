import React from 'react';
import { Image, Box, SimpleGrid, Center, Flex, Text, useColorModeValue, border } from '@chakra-ui/core';

import { FiMail } from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaInstagram, FaGithub } from 'react-icons/fa';
import echoLogoBlack from '../assets/echo-logo-very-wide-text-only.png';
import echoLogoWhite from '../assets/echo-logo-very-wide-text-only-white.png';

const Footer2 = (): JSX.Element => {
    const logo = useColorModeValue(echoLogoBlack, echoLogoWhite);
    const bg = useColorModeValue('gray.100', 'gray.900');
    const borderBg = useColorModeValue('#84008B', '#F2D865');

    return (
        <SimpleGrid
            columns={[1, 2, 3]}
            justifyItems="center"
            alignItems="center"
            spacingX="3em"
            spacingY="3em"
            borderTopWidth="0.3em"
            borderTopColor={borderBg}
            bgColor={bg}
            w="100%"
            pt="4em"
            pb="2em"
            pl="1em"
            pr="1em"
            mt="5em"
        >
            <SimpleGrid columns={2} spacing="3">
                <Box transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }}>
                    <FaFacebook size="4em" color={borderBg} />
                </Box>
                <Box transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }}>
                    <FaInstagram size="4em" color={borderBg} />
                </Box>
                <Box transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }}>
                    <FaTwitter size="4em" color={borderBg} />
                </Box>
                <Box transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }}>
                    <FaGithub size="4em" color={borderBg} />
                </Box>
            </SimpleGrid>
            <Image display={['none', null, 'block']} htmlWidth="300px" fit="contain" src={logo} />
            <SimpleGrid columns={1} spacing="3" fontSize="lg" maxWidth="170px" textAlign="center">
                <SimpleGrid columns={2} spacing="2" alignItems="center">
                    <FiMail size="2em" color={borderBg} />
                    <Text color={borderBg}>echo@uib.no</Text>
                </SimpleGrid>
                <Text color={borderBg}>Thormøhlensgate 55</Text>
                <Text color={borderBg}>5069 Bergen</Text>
                <Text color={borderBg}>Org nr: 000 000 000</Text>
            </SimpleGrid>
        </SimpleGrid>
    );
};

export default Footer2;
