import {
    Box,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    Flex,
    Heading,
    Skeleton,
} from '@chakra-ui/react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import type { RefObject } from 'react';
import NavLink, { NavLinkButton } from '@components/nav-link';
import ColorModeButton from '@components/color-mode-button';
import useLanguage from '@hooks/use-language';
import useAuth from '@hooks/use-auth';

const NavLinks = (): JSX.Element => {
    const isNorwegian = useLanguage();
    const { signedIn, loading } = useAuth();
    const router = useRouter();
    const onProfileClick = () => {
        if (signedIn) {
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
            alignItems="center"
            gap="5"
        >
            <NavLink text={isNorwegian ? 'Hjem' : 'Home'} href="/" data-cy="hjem" />
            {/* <NavLink text="Jobb" href="/job" data-cy="jobb" /> */}
            <NavLink text={isNorwegian ? 'Om echo' : 'About echo'} href="/om-echo/om-oss" data-cy="om-oss" />
            <Flex data-cy="min-profil">
                <Skeleton isLoaded={!loading}>
                    {signedIn && <NavLink text={isNorwegian ? 'Min profil' : 'My profile'} href="/profile" />}
                    {!signedIn && (
                        <NavLinkButton onClick={() => void onProfileClick()}>
                            {isNorwegian ? 'Logg inn' : 'Sign in'}
                        </NavLinkButton>
                    )}
                </Skeleton>
            </Flex>
            <ColorModeButton />
        </Flex>
    );
};

interface Props {
    isOpen: boolean;
    onClose: () => void;
    btnRef: RefObject<HTMLButtonElement>;
}

const NavBar = ({ isOpen, onClose, btnRef }: Props): JSX.Element => {
    const isNorwegian = useLanguage();

    return (
        <Box>
            <Flex
                display={['none', null, null, 'flex']}
                align="center"
                justify="space-between"
                w="full"
                direction="column"
            >
                <NavLinks />
            </Flex>

            <Drawer isOpen={isOpen} placement="right" onClose={onClose} finalFocusRef={btnRef}>
                <DrawerOverlay>
                    <DrawerContent data-cy="navbar-drawer">
                        <DrawerCloseButton size="lg" />
                        <DrawerHeader fontSize="2xl" as={Heading}>
                            {isNorwegian ? 'Navigasjon' : 'Navigation'}
                        </DrawerHeader>
                        <DrawerBody>
                            <Box onClick={onClose} data-cy="nav-links">
                                <NavLinks />
                            </Box>
                        </DrawerBody>
                    </DrawerContent>
                </DrawerOverlay>
            </Drawer>
        </Box>
    );
};

export default NavBar;
