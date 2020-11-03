import React from 'react';
import { Image, Box, SimpleGrid, Heading } from '@chakra-ui/core';

import instaLogo from '../assets/insta.png';
import facebookLogo from '../assets/facebook.png';
import githubLogo from '../assets/github.png';
import echoLogo from '../assets/echo.png';

const Footer = (): JSX.Element => {
    return (
        <Box w="100%" h="15%" position="fixed" bottom="0" bgColor="blue.900" overflow="hidden">
            <Image src={echoLogo} boxSize="md" />
        </Box>
    );
};

export default Footer;
