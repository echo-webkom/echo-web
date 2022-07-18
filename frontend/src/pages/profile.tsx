import { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Spinner, Center, Text, Button, useColorModeValue, Link, Flex, Spacer } from '@chakra-ui/react';
import { IoMdHome } from 'react-icons/io';
import type { UserWithName } from '@api/user';
import { UserAPI } from '@api/user';
import { isErrorMessage } from '@utils/error';
import Section from '@components/section';
import ProfileInfo from '@components/profile-info';
import SEO from '@components/seo';

const ProfilePage = (): JSX.Element => {
    const [user, setUser] = useState<UserWithName | null>();

    const bg = useColorModeValue('button.light.primary', 'button.dark.primary');
    const hover = useColorModeValue('button.light.primaryHover', 'button.dark.primaryHover');
    const active = useColorModeValue('button.light.primaryActive', 'button.dark.primaryActive');
    const textColor = useColorModeValue('button.light.text', 'button.dark.text');

    useEffect(() => {
        const fetchUser = async () => {
            const result = await UserAPI.getUser();

            if (!isErrorMessage(result)) {
                setUser(result);
            }
        };
        void fetchUser();
    }, []);

    const { status } = useSession();

    return (
        <>
            <SEO title={user?.name ?? status === 'unauthenticated' ? 'Profilside' : 'Logg inn'} />
            {status === 'authenticated' && (
                <>
                    <Section>
                        <Center>
                            {user ? (
                                <ProfileInfo user={user} />
                            ) : (
                                <Flex direction="column" maxW="400px" my="20" gap="3">
                                    <Text fontWeight="bold" fontSize="xl">
                                        Får ikke til å laste inn brukeren din.
                                    </Text>
                                    <Text>Prøv å logge inn på nytt, eller ta kontakt med noen i Webkom.</Text>
                                    <Button onClick={() => void signOut()}>Logg ut</Button>
                                </Flex>
                            )}
                        </Center>
                    </Section>
                </>
            )}
            {status === 'loading' && (
                <Center>
                    <Spinner />
                </Center>
            )}
            {status === 'unauthenticated' && (
                <Center>
                    <Section position="relative" height="300px" width="500px" alignContent="center">
                        <Flex direction="column" height="100%" justifyContent="center">
                            <Text align="center" fontSize="2xl" fontWeight="extrabold">
                                Du er ikke logget inn
                            </Text>
                            <Spacer />
                            <Button
                                width="fit-content"
                                margin="auto"
                                bg={bg}
                                color={textColor}
                                _hover={{ bg: hover }}
                                _active={{ borderColor: active }}
                                fontSize="lg"
                                borderRadius="0.5rem"
                                onClick={() => void signIn('feide')}
                            >
                                Logg inn med feide
                            </Button>
                            <Spacer />
                            <Link href="/" alignItems="center" justifyContent="center" display="flex">
                                <IoMdHome /> Hovedside
                            </Link>
                        </Flex>
                    </Section>
                </Center>
            )}
        </>
    );
};

export default ProfilePage;
