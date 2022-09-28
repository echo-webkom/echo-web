import { useState, useEffect, useContext } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Spinner, Center, Text, Button, useColorModeValue, Link, Flex, Spacer, Heading } from '@chakra-ui/react';
import { IoMdHome } from 'react-icons/io';
import type { User } from '@api/user';
import { UserAPI } from '@api/user';
import { type ErrorMessage, isErrorMessage } from '@utils/error';
import Section from '@components/section';
import ProfileInfo from '@components/profile-info';
import SEO from '@components/seo';
import LanguageContext from 'language-context';

const ProfilePage = (): JSX.Element => {
    const [user, setUser] = useState<User | null>();
    const [error, setError] = useState<ErrorMessage>();
    const [loading, setLoading] = useState<boolean>(true);

    const bg = useColorModeValue('button.light.primary', 'button.dark.primary');
    const hover = useColorModeValue('button.light.primaryHover', 'button.dark.primaryHover');
    const active = useColorModeValue('button.light.primaryActive', 'button.dark.primaryActive');
    const textColor = useColorModeValue('button.light.text', 'button.dark.text');

    const isNorwegian = useContext(LanguageContext);

    const { data } = useSession();

    useEffect(() => {
        const fetchUser = async () => {
            if (!data?.idToken || !data.user?.email || !data.user.name) return;

            const result = await UserAPI.getUser(data.user.email, data.user.name, data.idToken);

            if (!isErrorMessage(result)) {
                setUser(result);
            } else {
                setError(result);
            }

            setLoading(false);
        };

        void fetchUser();
    }, [data]);

    const { status } = useSession();

    return (
        <>
            <SEO title={user?.name ?? status === 'unauthenticated' ? 'Min profil' : 'Logg inn'} />
            {status === 'authenticated' && (
                <>
                    {error && (
                        <Section>
                            <Center>
                                <Flex flexDirection="column" maxW="400px" my="20" gap="5">
                                    <Heading fontWeight="bold" mx="auto">
                                        {isNorwegian ? 'Det har skjedd en feil' : 'An error has occurred'}
                                    </Heading>
                                    <Text textAlign="center">
                                        {isNorwegian
                                            ? 'Prøv å logg ut og så inn igjen, eller ta kontakt med Webkom.'
                                            : 'Try signing out and then signing in again, or contact Webkom.'}
                                    </Text>
                                    <Button onClick={() => void signOut()}>
                                        {isNorwegian ? 'Logg ut' : 'Sign out'}
                                    </Button>
                                </Flex>
                            </Center>
                        </Section>
                    )}
                    {loading && (
                        <Section>
                            <Center>
                                <Flex flexDirection="column" maxW="400px" my="20" gap="5">
                                    <Heading fontWeight="bold" mx="auto">
                                        {isNorwegian ? 'Laster inn brukeren din...' : 'Loading your account...'}
                                    </Heading>
                                    <Spinner size="xl" mx="auto" />
                                    <Button onClick={() => void signOut()}>
                                        {isNorwegian ? 'Logg ut' : 'Sign out'}
                                    </Button>
                                </Flex>
                            </Center>
                        </Section>
                    )}
                    {user && <ProfileInfo user={user} />}
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
                                {isNorwegian ? 'Logg inn med Feide' : 'Sign in with Feide'}
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
