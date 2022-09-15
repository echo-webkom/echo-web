import { useState, useEffect, useContext } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Spinner, Center, Text, Button, useColorModeValue, Link, Flex, Spacer, Heading } from '@chakra-ui/react';
import { IoMdHome } from 'react-icons/io';
import type { UserWithName } from '@api/user';
import { UserAPI } from '@api/user';
import { type ErrorMessage, isErrorMessage } from '@utils/error';
import Section from '@components/section';
import ProfileInfo from '@components/profile-info';
import SEO from '@components/seo';
import LanguageContext from 'language-context';

const ProfilePage = (): JSX.Element => {
    const [user, setUser] = useState<UserWithName | null>();
    const [error, setError] = useState<ErrorMessage>();
    const [loading, setLoading] = useState<boolean>(true);

    const bg = useColorModeValue('button.light.primary', 'button.dark.primary');
    const hover = useColorModeValue('button.light.primaryHover', 'button.dark.primaryHover');
    const active = useColorModeValue('button.light.primaryActive', 'button.dark.primaryActive');
    const textColor = useColorModeValue('button.light.text', 'button.dark.text');

    const isNorwegian = useContext(LanguageContext);

    useEffect(() => {
        const fetchUser = async () => {
            const result = await UserAPI.getUser();

            if (!isErrorMessage(result)) {
                setUser(result);
            } else {
                setError(result);
            }

            setLoading(false);
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
                            {error && (
                                <Flex flexDirection="column" maxW="400px" my="20" gap="5">
                                    <Heading fontWeight="bold" mx="auto">
                                        {isNorwegian ? 'Det har skjedd en feil' : 'An error has occurred'}
                                    </Heading>
                                    <Text textAlign="center">
                                        {isNorwegian
                                            ? 'Prøv å logg ut og så inn igjen, eller ta kontakt med Webkom.'
                                            : 'Try logging out and then logging in again, or contact Webkom.'}
                                    </Text>
                                    <Button onClick={() => void signOut()}>Logg ut</Button>
                                </Flex>
                            )}
                            {loading && (
                                <Flex flexDirection="column" maxW="400px" my="20" gap="5">
                                    <Heading fontWeight="bold" mx="auto">
                                        {isNorwegian ? 'Laster inn brukeren din...' : 'Loading your account...'}
                                    </Heading>
                                    <Spinner size="xl" mx="auto" />
                                    <Button onClick={() => void signOut()}>
                                        {isNorwegian ? 'Logg ut' : 'Log out'}
                                    </Button>
                                </Flex>
                            )}
                            {user && <ProfileInfo user={user} />}
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
                                {isNorwegian ? 'Du er ikke logget inn' : 'You are not logged in'}
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
                                {isNorwegian ? 'Logg inn med feide' : 'Log in with feide'}
                            </Button>
                            <Spacer />
                            <Link href="/" alignItems="center" justifyContent="center" display="flex">
                                <IoMdHome /> {isNorwegian ? 'Hovedside' : 'Homepage'}
                            </Link>
                        </Flex>
                    </Section>
                </Center>
            )}
        </>
    );
};

export default ProfilePage;
