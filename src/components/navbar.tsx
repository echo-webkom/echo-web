import {
    Box,
    Center,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    Flex,
    Heading,
    Icon,
    IconButton,
} from '@chakra-ui/react';
import { AiOutlineUser } from 'react-icons/ai';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { RefObject } from 'react';
import ColorModeButton from './color-mode-button';
import NavLink from './nav-link';

const NavLinks = (): JSX.Element => {
    const { status } = useSession();
    const router = useRouter();
    const onProfileClick = () => {
        if (status === 'authenticated') {
            void router.push('/profile');
        } else {
            void signIn('feide');
        }
    };

    return (
        <Flex
            flexDirection={['column', null, null, 'row']}
            w="100%"
            fontSize={['3xl', null, null, 'lg', '2xl']}
            justify="flex-end"
        >
            <NavLink text="Hjem" href="/" testid="hjem" />
            <NavLink text="For Studenter" href="/for-studenter" testid="for-studenter" />
            <NavLink text="For Bedrifter" href="/for-bedrifter" testid="for-bedrifter" />
            <NavLink text="Om echo" href="/om-oss" testid="om-oss" />
            <ColorModeButton />
            <IconButton
                ml={['.6rem', null, null, null, '.6rem']}
                aria-label={status === 'authenticated' ? 'Gå til profil' : 'Logg inn'}
                onClick={() => void onProfileClick()}
                variant="ghost"
                icon={
                    <Center>
                        <Icon as={AiOutlineUser} boxSize={7} />
                    </Center>
                }
            />
        </Flex>
    );
};

interface Props {
    isOpen: boolean;
    onClose: () => void;
    btnRef: RefObject<HTMLButtonElement>;
}

const NavBar = ({ isOpen, onClose, btnRef }: Props): JSX.Element => {
    return (
        <>
            <Box
                flex="2 1 auto"
                data-testid="navbar-standard"
                pb="1rem"
                pl={['0.5rem', null, null, null, '3rem', '4rem']}
            >
                <Flex
                    display={['none', null, null, 'flex']}
                    align="center"
                    justify="space-between"
                    w="full"
                    direction="column"
                >
                    <NavLinks />
                </Flex>
            </Box>
            <Drawer isOpen={isOpen} placement="right" onClose={onClose} finalFocusRef={btnRef}>
                <DrawerOverlay>
                    <DrawerContent data-testid="navbar-drawer">
                        <DrawerCloseButton size="lg" />
                        <DrawerHeader fontSize="2xl" as={Heading}>
                            Navigasjon
                        </DrawerHeader>
                        <DrawerBody>
                            <Box onClick={onClose}>
                                <NavLinks />
                            </Box>
                        </DrawerBody>
                    </DrawerContent>
                </DrawerOverlay>
            </Drawer>
        </>
    );
};

export default NavBar;
