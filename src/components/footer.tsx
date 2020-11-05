import React from 'react';
import { Image, Box, SimpleGrid, Heading, Flex, Text } from '@chakra-ui/core';

import { AiOutlineFacebook } from 'react-icons/ai';
import { FiFacebook, FiTwitter, FiInstagram, FiGithub } from 'react-icons/fi';
import instaLogo from '../assets/insta.png';
import facebookLogo from '../assets/facebook.png';
import githubLogo from '../assets/github.png';
import twitterLogo from '../assets/twitter.png';
import echo from '../assets/echo.png';
import echoLogo from '../assets/echo-logo-very-wide-text-only-white.png';

const Footer = (): JSX.Element => {
    return (
        <Flex align="center" justify="center" w="100%" h="15%" bottom="0" bgColor="blue.900" overflow="hidden">
            <Flex top="10%" position="relative">
                <SimpleGrid columns={2} h="200px" w="200px" position="relative">
                    <AiOutlineFacebook size="70px" color="#F7F7F7" />
                    <FiInstagram size="70px" color="#F7F7F7" />
                    <FiTwitter size="70px" color="#F7F7F7" />
                    <FiGithub size="70px" color="#F7F7F7" />
                </SimpleGrid>
            </Flex>
            <Flex align="center" justify="center" bgSize="sm">
                <Image src={echoLogo} htmlWidth="30%" overflow="hidden" align="center" top="10px" />
            </Flex>
            <Flex top="0">
                <Text top="0" fontSize="5xl" color="#F7F7F7" align="center">
                    Kontakt
                    <Text top="0" fontSize="md" color="#F7F7F7">
                        echo@uib.no
                        <Text top="0" fontSize="md" color="#F7F7F7">
                            Thormøhlensgate 55
                            <Text top="0" fontSize="md" color="#F7F7F7">
                                5069 Bergen
                            </Text>
                        </Text>
                    </Text>
                </Text>
            </Flex>
        </Flex>
    );
};

export default Footer;
