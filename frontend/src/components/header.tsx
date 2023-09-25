import { Center, Flex, Icon, IconButton, Spacer, useColorModeValue, useDisclosure } from '@chakra-ui/react';
import { useRef } from 'react';
import { IoIosMenu } from 'react-icons/io';
import NavBar from '@components/navbar';
import HeaderLogo from '@components/header-logo';

const Header = () => {
    const { isOpen, onOpen, onClose } = useDisclosure(); // state for drawer
    const menuButtonRef = useRef<HTMLButtonElement>(null); // ref hook for drawer button
    const borderBg = useColorModeValue('bg.light.tertiary', 'bg.dark.tertiary');

    return (
        <Flex
            w="90%"
            maxW="1300"
            px={['0', '5%', '50']}
            alignItems="flex-end"
            borderColor={borderBg}
            data-cy="header"
            my="2rem"
            mx="auto"
        >
            <HeaderLogo />

            <Spacer />

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
                data-cy="drawer-button"
            />
        </Flex>
    );
};

export default Header;
