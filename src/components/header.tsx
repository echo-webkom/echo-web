import {
    Center,
    Flex,
    Icon,
    IconButton,
    LinkBox,
    LinkOverlay,
    Text,
    useColorModeValue,
    useDisclosure,
} from '@chakra-ui/react';
import { isFriday, isThursday, getHours, isMonday } from 'date-fns';
import Image from 'next/image';
import NextLink from 'next/link';
import React, { useRef } from 'react';
import { IoIosMenu } from 'react-icons/io';
import NavBar from './navbar';

const RandomHeaderMessage = (): string => {
    const stdMessages = ['Bottom text', '🤙🤙🤙', 'Lorem ipsum', '90% stabil!', 'Uten sylteagurk!'];
    const now = new Date();

    if (isMonday(now)) {
        return 'New week, new me?';
    } else if (isThursday(now)) {
        if (getHours(now) < 12) {
            return 'Husk bedpres kl. 12:00!';
        }
        return 'Vaffeltorsdag 🧇';
    } else if (isFriday(now)) {
        return 'Tacofredag 🌯';
    }

    return stdMessages[Math.floor(Math.random() * stdMessages.length)];
};

const HeaderLogo = ({ message }: { message?: string }) => {
    // Logo without any text
    const smallLogo = '/android-chrome-512x512.png';

    // Logo with text. Changes logo depending on light/dark mode.
    // The small logo is the same for both modes.
    const bigLogo = useColorModeValue('/echo-logo.png', '/echo-logo-white.png');

    // Background of logo image, depending on light/dark mode.
    const bg = useColorModeValue('bg.light.secondary', 'bg.dark.secondary');

    // Color and background of message-box
    const textBg = useColorModeValue('highlight.light.primary', 'highlight.dark.primary');
    const textColor = useColorModeValue('white', 'black');

    const msg = message || RandomHeaderMessage();

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
                            {msg}
                        </Text>
                    </Flex>
                </LinkOverlay>
            </NextLink>
        </LinkBox>
    );
};

HeaderLogo.defaultProps = {
    message: '',
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

export default Header;
