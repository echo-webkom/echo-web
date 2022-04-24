import React, { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import {
    Spinner,
    Avatar,
    Center,
    Text,
    Input,
    FormControl,
    FormLabel,
    Select,
    RadioGroup,
    Button,
    Stack,
    Box,
} from '@chakra-ui/react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import SEO from '../components/seo';
import { UserAPI, User, isErrorMessage, Degree } from '../lib/api';
import Section from '../components/section';
import NavLink from '../components/nav-link';

const ProfilePage = (): JSX.Element => {
    const [user, setUser] = useState<User | undefined>();

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
            <SEO title="Profile page" />
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
                            Sign out
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
                <>
                    <Text>Du er logget ut</Text>
                    <NavLink href={'/'} text="<- Hjem" />
                </>
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

    const submitForm: SubmitHandler<inputValues> = (data) => {
        setEditing(false);
        console.log(data);
    };

    return (
        <Stack direction={'row'}>
            <Box border={'1px'}>
                <Avatar size={'2xl'} name={user.firstName} src="" />
            </Box>
            <Box border={'1px'}>
                <Text>{user.firstName}</Text>
                <Text>{user.email}</Text>
            </Box>

            <Box border={'1px'}>
                <Text>PåmeldingsInformasjon</Text>
                {editing && (
                    <Button type="submit" form="profile-form" mr={3} colorScheme="teal">
                        Send inn
                    </Button>
                )}
                {!editing && (
                    <Button onClick={() => setEditing(true)} mr={3} colorScheme="teal">
                        Edit
                    </Button>
                )}

                <Text>Studieretning: {user.degree ? user.degree : ''}</Text>
                {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                <form data-cy="reg-form" id="profile-form" onSubmit={handleSubmit(submitForm)}>
                    {editing && (
                        <FormProvider {...methods}>
                            <FormControl id="degree" isRequired>
                                <FormLabel>Studieretning</FormLabel>
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
                            </FormControl>
                            <FormControl as="fieldset" isRequired>
                                <FormLabel as="legend">Hvilket trinn går du på?</FormLabel>
                                <RadioGroup defaultValue="1">
                                    <Select placeholder="Velg årstrinn" {...register('grade')}>
                                        <option value={'1'}>år 1</option>
                                        <option value={'2'}>år 2</option>
                                        <option value={'3'}>år 3</option>
                                        <option value={'4'}>år 4</option>
                                        <option value={'5'}>år 5</option>
                                    </Select>
                                </RadioGroup>
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Allergier</FormLabel>
                                <Input {...register('allergies')} />
                            </FormControl>
                        </FormProvider>
                    )}
                </form>
            </Box>
        </Stack>
    );
};

export default ProfilePage;
