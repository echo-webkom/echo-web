import { useContext } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Spinner, Center, Text, Button, useColorModeValue, Link, Flex, Spacer } from '@chakra-ui/react';
import { IoMdHome } from 'react-icons/io';
import Section from '@components/section';
import ProfileInfo from '@components/profile-info';
import SEO from '@components/seo';
import LanguageContext from 'language-context';

const ProfilePage = (): JSX.Element => {
    const bg = useColorModeValue('button.light.primary', 'button.dark.primary');
    const hover = useColorModeValue('button.light.primaryHover', 'button.dark.primaryHover');
    const active = useColorModeValue('button.light.primaryActive', 'button.dark.primaryActive');
    const textColor = useColorModeValue('button.light.text', 'button.dark.text');

    const isNorwegian = useContext(LanguageContext);

    const { status } = useSession();

    return (
        <>
            <SEO title={status === 'authenticated' ? 'Min profil' : 'Logg inn'} />
            {status === 'authenticated' && <ProfileInfo />}
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
