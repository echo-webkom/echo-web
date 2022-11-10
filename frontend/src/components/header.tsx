import { Box, Center, Flex, Icon, IconButton, useColorModeValue, useDisclosure } from '@chakra-ui/react';
import { memo, useRef } from 'react';
import { IoIosMenu } from 'react-icons/io';
import NavBar from '@components/navbar';
import HeaderLogo from '@components/header-logo';

const Header = (): JSX.Element => {
    const { isOpen, onOpen, onClose } = useDisclosure(); // state for drawer
    const menuButtonRef = useRef<HTMLButtonElement>(null); // ref hook for drawer button
    const borderBg = useColorModeValue('bg.light.tertiary', 'bg.dark.tertiary');

    return (
        <Box>
            <Center borderColor={borderBg} data-cy="header" m="2rem auto">
                <Flex w="90%" h="120px" alignItems="flex-end" maxW="1300" px={['0', '5%', '50']}>
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
                        data-cy="drawer-button"
                    />
                </Flex>
            </Center>
        </Box>
    );
};

export default memo(Header);
