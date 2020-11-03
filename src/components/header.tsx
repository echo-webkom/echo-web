import React, { useState } from 'react';
import { Flex, IconButton, Icon, Image, useColorModeValue } from '@chakra-ui/core';

import NavBar from './navbar';

import imgLogo from '../assets/echo-logo-very-wide-logo-only.png';
import imgLogoText from '../assets/echo-logo-very-wide-text-only.png';
import imgLogoTextWhite from '../assets/echo-logo-very-wide-text-only-white.png';

const Header = (): JSX.Element => {
    const [show, setShow] = useState(false);
    const logoText = useColorModeValue(imgLogoText, imgLogoTextWhite);

    return (
        <>
            <Flex align="center" justify="center" p="20px">
                <Flex align="center" justify={{ base: 'space-between', sm: 'center' }} w="500px">
                    <Image src={imgLogo} alt="logo" htmlWidth="30%" />
                    <Image display={{ base: 'none', sm: 'block' }} src={logoText} alt="logo-text" htmlWidth="50%" />
                    <IconButton
                        onClick={() => setShow((prevShow) => !prevShow)}
                        display={{ base: 'block', sm: 'none' }}
                        aria-label="show navbar"
                    >
                        <Icon viewBox="0 0 20 20" color="black.400" boxSize="10">
                            <path fill="currentColor" d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
                        </Icon>
                    </IconButton>
                </Flex>
            </Flex>
            <NavBar visible={show} />
        </>
    );
};

export default Header;
