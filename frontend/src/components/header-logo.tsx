import { Box, LinkBox, LinkOverlay, Text, useColorModeValue } from '@chakra-ui/react';
import { isFriday, isThursday, getDate, getHours, getMonth, getWeek, isMonday } from 'date-fns';
import { nb } from 'date-fns/locale';
import Image from 'next/image';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import LogoAccesory from '@components/logo-accesory';

const randomHeaderMessage = () => {
    const now = new Date();

    const stdMessages = () => {
        const baseMessages = [
            'Bottom text',
            '🤙🤙🤙',
            'Lorem ipsum',
            'Uten sylteagurk!',
            'Spruuutnice',
            'Skambra!',
            'For ei skjønnas 😍',
            'Vim eller forsvinn',
            'Mye å gjøre? SUCK IT UP!',
            '@echo_webkom',
            '@echo_uib',
            'JAJ FOR FAJ',
            'Dubkom',
        ];

        // Month-based messages
        if (getMonth(now) === 9) return [...baseMessages, 'BØ!', 'UuUuuUuuUuUu'];
        if (getMonth(now) === 11) return [...baseMessages, 'Ho, ho, ho!'];

        // Week-based messages
        const currentWeek = getWeek(now, { locale: nb });
        if (currentWeek === 34 || currentWeek === 35)
            return [...baseMessages, 'Velkommen (tilbake)!', 'New semester, new me?'];

        // Day-based messages
        if (isThursday(now)) return [...baseMessages, 'Vaffeltorsdag 🧇'];
        if (isFriday(now)) return [...baseMessages, 'Tacofredag 🌯'];

        return baseMessages;
    };

    // Messages that override stdMessages
    if (getMonth(now) === 4 && getDate(now) === 17) {
        return 'Gralla 🇳🇴';
    } else if ([5, 6].includes(getMonth(now))) {
        return 'God sommer 🌞';
    } else if (isThursday(now) && getHours(now) < 12) {
        return 'Husk bedpres kl. 12:00!';
    } else if (getMonth(now) === 11 && getDate(now) >= 24) {
        return 'God jul! 🎅';
    } else if (getMonth(now) === 0 && getDate(now) === 1) {
        return 'Godt nyttår! ✨';
    } else if (isMonday(now)) {
        return 'New week, new me?';
    }

    return stdMessages()[Math.floor(Math.random() * stdMessages().length)];
};

const HeaderLogo = () => {
    const [headerMessage, setHeaderMessage] = useState('');

    useEffect(() => {
        setHeaderMessage(randomHeaderMessage());
    }, []);

    // Logo without any text
    const smallLogo = '/android-chrome-512x512.png';

    // Logo with text. Changes logo depending on light/dark mode.
    // The small logo is the same for both modes.
    const bigLogo = useColorModeValue('/echo-logo.png', '/echo-logo-white.png');

    // Background of logo image, depending on light/dark mode.
    const bg = useColorModeValue('bg.light.secondary', 'bg.dark.secondary');

    // Logo accesory
    const month = getMonth(new Date());
    const logoAcc = month === 11 ? '/christmas-icons/santa_hat.svg' : month === 9 ? '/halloween-icons/hat.svg' : null;

    // Color and background of message-box
    const textBg = useColorModeValue('highlight.light.primary', 'highlight.dark.primary');
    const textColor = useColorModeValue('white', 'black');

    return (
        <LinkBox
            p="1rem"
            bg={bg}
            shadow="lg"
            data-cy="header-logo"
            borderRadius="lg"
            boxShadow="0 10px 20px 0 rgba(0, 0, 0, 0.1)"
        >
            <LinkOverlay as={NextLink} href="/">
                <Box display={{ base: 'none', md: 'block' }}>
                    <Image src={bigLogo} alt="logo" width={260} height={77} />
                </Box>

                <Box display={{ base: 'block', md: 'none' }}>
                    <Image src={smallLogo} alt="logo" width={90} height={90} />
                </Box>
            </LinkOverlay>

            {logoAcc && <LogoAccesory iconSrc={logoAcc} h={40} w={40} />}

            <Box
                pos="absolute"
                rounded="lg"
                boxShadow="0 10px 20px rgba(0, 0, 0, 0.1)"
                px="3"
                py="1"
                w="max"
                bg={textBg}
                color={textColor}
            >
                <Text fontSize="md">{headerMessage}</Text>
            </Box>
        </LinkBox>
    );
};

export default HeaderLogo;
