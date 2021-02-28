import React, { useRef } from 'react';
import { IoIosMenu } from 'react-icons/io';
import { Text, Box, Center, Flex, IconButton, Image, useColorModeValue, useDisclosure } from '@chakra-ui/react'; // wow very bloat

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
        <Flex
            position="relative"
            h="full"
            px="2.5rem"
            py="1rem"
            justifyContent="center"
            bg={bg}
            shadow="lg"
            align="center"
            border="2px"
            wrap="nowrap"
            minWidth="300px"
        >
            <Image src={logoImg} alt="logo" float="left" h="100%" />
            <Image src={textImg} alt="logo-text" float="left" h="100%" />
            <Text
                bg="purple.400"
                position="absolute"
                bottom="0.4rem"
                left="93%"
                whiteSpace="nowrap"
                pb="0.1rem"
                pt="0.2rem"
                px="1rem"
                align="center"
                color="white"
            >
                {messageText}
            </Text>
        </Flex>
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
        <Box mb="1rem" pb="1rem" borderBottom="1px" borderColor={borderBg} data-testid="header-standard" pt="0.5rem">
            <Flex
                w="70%"
                h={{ sm: '100px', md: '120px', lg: '140px' }}
                m="auto"
                justify="space-between"
                alignItems="flex-end"
            >
                <HeaderLogo bg={bg} messageText="Dette er midlertidig" logoImg={logo} textImg={logoText} />
                <IconButton
                    variant="unstyled"
                    ref={menuButtonRef}
                    onClick={onOpen}
                    display={{ base: 'block', sm: 'none' }}
                    aria-label="show navbar"
                    icon={
                        <Center>
                            <IoIosMenu size="2.5em" />
                        </Center>
                    }
                    border="2px"
                />
                <NavBar isOpen={isOpen} onClose={onClose} btnRef={menuButtonRef} />
            </Flex>
        </Box>
    );
};

export default Header;
