import React, { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import {
    Spinner,
    Avatar,
    Center,
    Text,
    FormControl,
    HStack,
    Select,
    Button,
    Stack,
    Box,
    useColorModeValue,
    Link,
    Flex,
    Spacer,
} from '@chakra-ui/react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { IoMdHome } from 'react-icons/io';
import SEO from '../components/seo';
import { UserAPI, User, isErrorMessage, Degree } from '../lib/api';
import Section from '../components/section';

const ProfilePage = (): JSX.Element => {
    const [user, setUser] = useState<User | undefined>();

    const bg = useColorModeValue('button.light.primary', 'button.dark.primary');
    const hover = useColorModeValue('button.light.primaryHover', 'button.dark.primaryHover');
    const active = useColorModeValue('button.light.primaryActive', 'button.dark.primaryActive');
    const textColor = useColorModeValue('button.light.text', 'button.dark.text');

    useEffect(() => {
        const fetchUser = async () => {
            const result = await UserAPI.getUser();
            if (isErrorMessage(result)) {
            } else {
                setUser(result);
            }
        };
        void fetchUser();
    }, []);

    const { status } = useSession();

    return (
        <>
            <SEO title={user ? user.name : status === 'unauthenticated' ? 'Logg inn' : 'Profilside'} />
            {status === 'authenticated' && (
                <>
                    <Section position={'relative'}>
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

interface inputValues {
    grade: string;
    degree: Degree;
    allergies: string;
}

const ProfileInfo = ({ user }: { user: User }): JSX.Element => {
    const methods = useForm<inputValues>();
    const [editing, setEditing] = useState(false);
    const { register, handleSubmit } = methods;

    const submitForm: SubmitHandler<inputValues> = () => {
        setEditing(false);
    };

    return (
        <Stack direction={['column', null, 'row']}>
            <Box>
                <Avatar size={'2xl'} name={user.name} src="" />
            </Box>
            <Box>
                <Text>{user.name}</Text>
                <Text>{user.email}</Text>
            </Box>

            <Box>
                <Text>PåmeldingsInformasjon</Text>
                {!editing && (
                    <>
                        {/**<Button onClick={() => setEditing(true)} mr={3} colorScheme="teal">
                            Edit
                        </Button>**/}
                        <Text>Studieretning: {user.degree ? user.degree : ''}</Text>
                        <Text>Årstrinn: {user.degree ? user.degree : ''}</Text>
                    </>
                )}
                {editing && (
                    <>
                        <Button type="submit" form="profile-form" mr={3} colorScheme="teal">
                            Lagre
                        </Button>
                        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                        <form data-cy="reg-form" id="profile-form" onSubmit={handleSubmit(submitForm)}>
                            <FormProvider {...methods}>
                                <FormControl id="degree" isRequired>
                                    <HStack>
                                        <Text>Studieretning: </Text>
                                        <Select placeholder="Velg studieretning" {...register('degree')}>
                                            <option value={Degree.DTEK}>Datateknologi</option>
                                            <option value={Degree.DSIK}>Datasikkerhet</option>
                                            <option value={Degree.DVIT}>Data Science/Datavitenskap</option>
                                            <option value={Degree.BINF}>Bioinformatikk</option>
                                            <option value={Degree.IMO}>Informatikk-matematikk-økonomi</option>
                                            <option value={Degree.IKT}>Informasjons- og kommunikasjonsteknologi</option>
                                            <option value={Degree.KOGNI}>
                                                Kognitiv vitenskap med spesialisering i informatikk
                                            </option>
                                            <option value={Degree.INF}>Master i informatikk</option>
                                            <option value={Degree.PROG}>Felles master i programvareutvikling</option>
                                            <option value={Degree.ARMNINF}>Årsstudium i informatikk</option>
                                            <option value={Degree.POST}>Postbachelor</option>
                                            <option value={Degree.MISC}>Annet studieløp</option>
                                        </Select>
                                    </HStack>
                                </FormControl>
                                <FormControl as="fieldset" isRequired>
                                    <HStack>
                                        <Text>Årstrinn</Text>
                                        <Select placeholder="Velg årstrinn" {...register('grade')}>
                                            <option value={'1'}>1</option>
                                            <option value={'2'}>2</option>
                                            <option value={'3'}>3</option>
                                            <option value={'4'}>4</option>
                                            <option value={'5'}>5</option>
                                        </Select>
                                    </HStack>
                                </FormControl>
                            </FormProvider>
                        </form>
                    </>
                )}
            </Box>
        </Stack>
    );
};

export default ProfilePage;
