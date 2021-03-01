import React, { useRef } from 'react';
import { IoIosMenu } from 'react-icons/io';
import { Text, Box, Center, Flex, IconButton, Img, useColorModeValue, useDisclosure } from '@chakra-ui/react'; // wow very bloat

import NavBar from './navbar';

const imgLogo = '/echo-logo-black.svg';
const imgLogoWhite = '/echo-logo-white.svg';
const imgLogoText = '/echo-logo-very-wide-text-only.png';
const imgLogoTextWhite = '/echo-logo-very-wide-text-only-white.png';

const HeaderLogo = ({
    logoImg,
    textImg,
    messageText,
    bg,
}: {
    logoImg: string;
    textImg: string;
    messageText: string;
    bg: string;
}) => {
    return (
        <Box
            position="relative"
            px="2.5rem"
            py="1rem"
            bg={bg}
            shadow="lg"
            align="center"
            wrap="nowrap"
            minWidth="300px"
            minHeight="100px"
            w="300px"
            h="100px"
        >
            <Img src={logoImg} alt="logo" float="left" w="40%" maxHeight="100%" />
            <Img src={textImg} alt="logo-text" float="left" w="60%" maxHeight="100%" />
            {messageText && (
                <Text
                    bg="purple.400"
                    position="absolute"
                    bottom="-1.2rem"
                    left="5%"
                    whiteSpace="nowrap"
                    pb="0.1rem"
                    pt="0.2rem"
                    px="1rem"
                    align="center"
                    color="white"
                >
                    {messageText}
                </Text>
            )}
        </Box>
    );
};

const Header = (): JSX.Element => {
    const { isOpen, onOpen, onClose } = useDisclosure(); // state for drawer
    const menuButtonRef = useRef<HTMLButtonElement>(null); // ref hook for drawer button
    const logo = useColorModeValue(imgLogo, imgLogoWhite);
    const logoText = useColorModeValue(imgLogoText, imgLogoTextWhite); // logo version based on color mode
    const bg = useColorModeValue('gray.100', 'gray.900'); // defining color mode colors
    const borderBg = useColorModeValue('gray.300', 'gray.800');

    return (
        <Box mb="1rem" pb="1rem" borderBottom="1px" borderColor={borderBg} data-testid="header-standard">
            <Flex w="70%" h="120px" m="auto" justify="space-between" alignItems="flex-end">
                <HeaderLogo bg={bg} messageText="" logoImg={logo} textImg={logoText} />
                <NavBar isOpen={isOpen} onClose={onClose} btnRef={menuButtonRef} />
                <IconButton
                    variant="unstyled"
                    ref={menuButtonRef}
                    onClick={onOpen}
                    display={['block', null, null, 'none']}
                    aria-label="show navbar"
                    icon={
                        <Center>
                            <IoIosMenu size="2.5em" />
                        </Center>
                    }
                    border="2px"
                />
            </Flex>
        </Box>
    );
};

export default Header;
