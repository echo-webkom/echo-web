import {
    Center,
    Flex,
    Box,
    Icon,
    IconButton,
    LinkBox,
    LinkOverlay,
    Text,
    useColorModeValue,
    useDisclosure,
} from '@chakra-ui/react';
import { isFriday, isThursday, getHours, getMonth, isMonday } from 'date-fns';
import Image from 'next/image';
import NextLink from 'next/link';
import React, { memo, useRef } from 'react';
import { IoIosMenu } from 'react-icons/io';
import { motion } from 'framer-motion';
import NavBar from './navbar';

const randomHeaderMessage = (): string => {
    const now = new Date();

    const stdMessages = () => {
        const baseMessages = ['Bottom text', '🤙🤙🤙', 'Lorem ipsum', '90% stabil!', 'Uten sylteagurk!', 'Spruuutnice'];

        if (getMonth(now) === 9) return baseMessages.concat(['BØ!', 'UuUuuUuuUuUu']);

        if (isThursday(now)) return baseMessages.concat(['Vaffeltorsdag 🧇']);

        if (isFriday(now)) return baseMessages.concat(['Tacofredag 🌯']);

        return baseMessages;
    };

    if (isMonday(now)) {
        return 'New week, new me?';
    } else if (isThursday(now) && getHours(now) < 12) {
        return 'Husk bedpres kl. 12:00!';
    }

    return stdMessages()[Math.floor(Math.random() * stdMessages().length)];
};

const HeaderLogo = () => {
    // Logo without any text
    const smallLogo = '/android-chrome-512x512.png';

    // Logo with text. Changes logo depending on light/dark mode.
    // The small logo is the same for both modes.
    const bigLogo = useColorModeValue('/echo-logo.png', '/echo-logo-white.png');

    // Background of logo image, depending on light/dark mode.
    const bg = useColorModeValue('bg.light.secondary', 'bg.dark.secondary');

    // Logo accesory
    const logoAcc = '';

    // Color and background of message-box
    const textBg = useColorModeValue('highlight.light.primary', 'highlight.dark.primary');
    const textColor = useColorModeValue('white', 'black');

    return (
        <LinkBox
            p="1.05rem"
            bg={bg}
            shadow="lg"
            data-testid="header-logo"
            borderRadius="0.5rem"
            boxShadow="0 10px 20px 0 rgba(0, 0, 0, 0.1)"
        >
            <Flex display={{ base: 'none', md: 'block' }}>
                <Image src={bigLogo} alt="logo" width={260} height={77} />
            </Flex>
            <Flex display={{ base: 'block', md: 'none' }}>
                <Image src={smallLogo} alt="logo" width={90} height={90} />
            </Flex>
            {logoAcc && <LogoAccesory iconSrc={logoAcc} h={40} w={40} />}
            <NextLink href="/" passHref>
                <LinkOverlay>
                    <Flex position="absolute" bottom="-1rem" left="5%" w="20rem">
                        <Text
                            bg={textBg}
                            pb="0.1rem"
                            pt="0.2rem"
                            px="1rem"
                            align="left"
                            color={textColor}
                            fontSize="md"
                            noOfLines={1}
                            suppressHydrationWarning
                            borderRadius="0.25rem"
                            boxShadow="0 10px 20px 0 rgba(0, 0, 0, 0.1)"
                        >
                            {randomHeaderMessage()}
                        </Text>
                    </Flex>
                </LinkOverlay>
            </NextLink>
        </LinkBox>
    );
};

const LogoAccesory = ({ iconSrc, h, w }: { iconSrc: string; h: number; w: number }): JSX.Element => {
    return (
        <Box display={{ base: 'none', md: 'block' }}>
            <motion.div
                style={{
                    position: 'absolute',
                    left: 114,
                    top: 7,
                    transform: 'rotate(-20deg)',
                }}
            >
                <Image src={iconSrc} alt="" width={w} height={h} />
            </motion.div>
        </Box>
    );
};

const Header = (): JSX.Element => {
    const { isOpen, onOpen, onClose } = useDisclosure(); // state for drawer
    const menuButtonRef = useRef<HTMLButtonElement>(null); // ref hook for drawer button
    const borderBg = useColorModeValue('bg.light.tertiary', 'bg.dark.tertiary');

    return (
        <Center
            mt="1rem"
            mb="1rem"
            pb="1rem"
            pt={['12px', null, '0']}
            borderColor={borderBg}
            data-testid="header-standard"
        >
            <Flex w={['90%', '70%']} h="120px" alignItems="flex-end" justify="">
                <HeaderLogo />
                <NavBar isOpen={isOpen} onClose={onClose} btnRef={menuButtonRef} />
                <IconButton
                    variant="unstyled"
                    ref={menuButtonRef}
                    onClick={onOpen}
                    display={['block', null, null, 'none']}
                    aria-label="show navbar"
                    icon={
                        <Center>
                            <Icon as={IoIosMenu} boxSize={10} />
                        </Center>
                    }
                    data-testid="drawer-button"
                />
            </Flex>
        </Center>
    );
};

export default memo(Header);
