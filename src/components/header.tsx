import React, { useRef } from 'react';
import { IoIosMenu } from 'react-icons/io';
import NextLink from 'next/link';
import {
    Text,
    Box,
    Center,
    Flex,
    IconButton,
    Img,
    useColorModeValue,
    useDisclosure,
    LinkOverlay,
    LinkBox,
} from '@chakra-ui/react';

import NavBar from './navbar';

const imgLogo = '/android-chrome-512x512.png';
const imgLogoText = '/echo-logo.png';
const imgLogoTextWhite = '/echo-logo-white.png';

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
        <LinkBox
            _hover={{ cursor: 'pointer' }}
            maxW="300px"
            position="relative"
            p="1em"
            bg={bg}
            shadow="lg"
            align="center"
            wrap="nowrap"
            data-testid="header-logo"
        >
            <Img src={logoImg} alt="logo" float="left" maxHeight="100%" w="90px" h="90px" display={['block', 'none']} />
            <Img src={textImg} alt="logo-text" float="left" maxHeight="100%" display={['none', 'block']} />
            {messageText && (
                <NextLink href="/" passHref>
                    <LinkOverlay>
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
                    </LinkOverlay>
                </NextLink>
            )}
        </LinkBox>
    );
};

const Header = (): JSX.Element => {
    const { isOpen, onOpen, onClose } = useDisclosure(); // state for drawer
    const menuButtonRef = useRef<HTMLButtonElement>(null); // ref hook for drawer button
    const logoText = useColorModeValue(imgLogoText, imgLogoTextWhite); // logo version based on color mode
    const bg = useColorModeValue('bg2Light', 'bg2Dark'); // defining color mode colors
    const borderBg = useColorModeValue('gray.300', 'gray.800');

    return (
        <Box mt="1rem" mb="2rem" pb="1rem" borderColor={borderBg} data-testid="header-standard">
            <Center>
                <Flex w={['90%', '70%']} h="120px" justify="space-between" alignItems="flex-end">
                    <HeaderLogo bg={bg} messageText="Ny nettside!" logoImg={imgLogo} textImg={logoText} />
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
                        data-testid="drawer-button"
                    />
                </Flex>
            </Center>
        </Box>
    );
};

export default Header;
