import React, { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Spinner, Center, Text, Button, useColorModeValue, Link, Flex, Spacer } from '@chakra-ui/react';
import { IoMdHome } from 'react-icons/io';
import SEO from '../components/seo';
import { UserAPI, UserWithName, isErrorMessage } from '../lib/api';
import Section from '../components/section';
import ProfileInfo from '../components/profile-info';

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
            <SEO title={user?.name ?? status === 'unauthenticated' ? 'Logg inn' : 'Profilside'} />
            {status === 'authenticated' && (
                <>
                    <Section position="relative">
                        <Button
                            onClick={() => {
                                void signOut();
                            }}
                            position={'absolute'}
                            left={'0.5em'}
                            top={'0.5em'}
                        >
                            Logg ut
                        </Button>
                        <Center mt={'1.5em'}>{user && <ProfileInfo user={user} />}</Center>
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
                    <Section position="relative" height="300px" width="500px" alignContent={'center'}>
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
                                {<IoMdHome />} Hovedside
                            </Link>
                        </Flex>
                    </Section>
                </Center>
            )}
        </>
    );
};

export default ProfilePage;
