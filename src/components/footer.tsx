import React from 'react';
import { Image, Box, SimpleGrid, Center, Flex, Text, useColorModeValue } from '@chakra-ui/core';

import { FiMail } from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaInstagram, FaGithub } from 'react-icons/fa';
import echoLogoBlack from '../assets/echo-logo-very-wide-text-only.png';
import echoLogoWhite from '../assets/echo-logo-very-wide-text-only-white.png';

const Footer = (): JSX.Element => {
    const logo = useColorModeValue(echoLogoBlack, echoLogoWhite);
    const bg = useColorModeValue('metallicSeaweed.400', 'metallicSeaweed.600');

    return (
        <SimpleGrid
            columns={[1, 2, 3]}
            justifyItems="center"
            alignItems="center"
            spacingX="3em"
            spacingY="3em"
            bg={bg}
            w="100%"
            pt="4em"
            pb="2em"
            pl="1em"
            pr="1em"
            mt="5em"
        >
            <SimpleGrid columns={2} spacing="3">
                <FaFacebook size="4em" />
                <FaInstagram size="4em" />
                <FaTwitter size="4em" />
                <FaGithub size="4em" />
            </SimpleGrid>
            <Image display={['none', null, 'block']} htmlWidth="300px" fit="contain" src={logo} />
            <SimpleGrid columns={1} spacing="3" fontSize="lg" maxWidth="170px" textAlign="center">
                <SimpleGrid columns={2} spacing="2" alignItems="center">
                    <FiMail size="2em" />
                    <Text>echo@uib.no</Text>
                </SimpleGrid>
                <Text>Thormøhlensgate 55</Text>
                <Text>5069 Bergen</Text>
                <Text>Org nr: 000 000 000</Text>
            </SimpleGrid>
        </SimpleGrid>
    );
};

export default Footer;
