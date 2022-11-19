import { useState, useContext, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import type { SubmitHandler } from 'react-hook-form';
import { BsQuestion } from 'react-icons/bs';
import { useForm, FormProvider } from 'react-hook-form';
import { MdOutlineEmail } from 'react-icons/md';
import { GrGroup } from 'react-icons/gr';
import { CgProfile } from 'react-icons/cg';
import { AiFillCheckCircle } from 'react-icons/ai';
import {
    Icon,
    SimpleGrid,
    GridItem,
    useToast,
    Center,
    Progress,
    Tooltip,
    Divider,
    Input,
    HStack,
    Heading,
    FormControl,
    InputGroup,
    InputRightAddon,
    Button,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import capitalize from '@utils/capitalize';
import type { ProfileFormValues, User } from '@api/user';
import { UserAPI } from '@api/user';
import { isErrorMessage } from '@utils/error';
import FormDegree from '@components/form-degree';
import FormDegreeYear from '@components/form-degree-year';
import IconText from '@components/icon-text';
import Section from '@components/section';
import LanguageContext from 'language-context';

interface ProfileState {
    infoState: 'idle' | 'edited' | 'saving' | 'saved' | 'error' | 'warning';
    infoProgress: 'none' | 'degree' | 'degreeYear' | 'all';
    errorMessage: string | null;
}

const userToInfoProgress = (user: User): ProfileState['infoProgress'] => {
    if (user.degree && user.degreeYear) return 'all';
    if (user.degree) return 'degree';
    if (user.degreeYear) return 'degreeYear';

    return 'none';
};

const infoProgressNumber = (progress: ProfileState['infoProgress']): number => {
    switch (progress) {
        case 'none': {
            return 0;
        }
        case 'degree': {
            return 50;
        }
        case 'degreeYear': {
            return 50;
        }
        case 'all': {
            return 100;
        }
    }
};

const ProfileInfo = ({ user }: { user: User }): JSX.Element => {
    const isNorwegian = useContext(LanguageContext);
    const methods = useForm<ProfileFormValues>({
        defaultValues: {
            degree: user.degree ?? null,
            degreeYear: user.degreeYear ?? null,
            alternateEmail: user.alternateEmail ?? null,
        },
    });
    const { handleSubmit, register } = methods;
    const [profileState, setProfileState] = useState<ProfileState>({
        infoState: 'idle',
        infoProgress: userToInfoProgress(user),
        errorMessage: null,
    });
    const done = profileState.infoProgress === 'all';

    const toast = useToast();

    const { data } = useSession();

    useEffect(() => {
        if (profileState.infoState === 'error' || profileState.infoState === 'warning') {
            toast({
                title: isNorwegian ? 'Det har skjedd en feil.' : 'An error has occurred.',
                description: profileState.errorMessage,
                status: profileState.infoState,
                duration: 8000,
                isClosable: true,
            });
        }
    }, [profileState, toast, isNorwegian]);

    const submitForm: SubmitHandler<ProfileFormValues> = async (profileFormVals: ProfileFormValues) => {
        if (!data?.idToken) {
            setProfileState({
                ...profileState,
                infoState: 'error',
                errorMessage: 'Du er ikke logget inn. Prøv på nytt.',
            });
            return;
        }
        setProfileState({ ...profileState, infoState: 'saving', errorMessage: null });

        const newUser: User = {
            email: user.email,
            name: user.name,
            alternateEmail: profileFormVals.alternateEmail !== '' ? profileFormVals.alternateEmail : null,
            // @ts-expect-error
            degree: profileFormVals.degree !== '' ? profileFormVals.degree : null,
            // @ts-expect-error
            degreeYear: profileFormVals.degreeYear !== '' ? profileFormVals.degreeYear : null,
            memberships: [],
        };

        const res = await UserAPI.putUser(newUser, data.idToken);

        if (isErrorMessage(res)) {
            setProfileState({ ...profileState, infoState: 'error', errorMessage: res.message });
            return;
        }

        if (res.status === 200) {
            setProfileState({ infoState: 'saved', infoProgress: userToInfoProgress(newUser), errorMessage: null });
        } else {
            setProfileState({ ...profileState, infoState: 'warning', errorMessage: res.response });
        }
    };

    return (
        <Center>
            <SimpleGrid columns={2} gap={4} w="60%">
                <GridItem colSpan={2}>
                    <Section>
                        <Center mb="1rem">
                            <Heading size="2xl">Min profil</Heading>
                        </Center>
                        <Divider my="1rem" />
                        <IconText data-cy="profile-name" icon={CgProfile} text={user.name} />
                        <IconText data-cy="profile-email" icon={MdOutlineEmail} text={user.email} />
                        {user.memberships.length > 0 && (
                            <IconText
                                icon={GrGroup}
                                text={user.memberships.map((m: string) => capitalize(m)).join(', ')}
                            />
                        )}
                    </Section>
                </GridItem>
                <GridItem colSpan={2}>
                    <Section>
                        <Tooltip
                            label={
                                done
                                    ? 'Du har fylt ut all informasjonen du trenger for å melde deg på arrangementer!'
                                    : 'Du må fylle ut all informasjonen under før du kan melde deg på arrangementer'
                            }
                        >
                            <SimpleGrid columns={15} mb="1rem">
                                <GridItem colSpan={14} mt="0.6rem">
                                    <Progress
                                        value={infoProgressNumber(profileState.infoProgress)}
                                        transition="0.6s ease"
                                        sx={{
                                            '& > div:first-child': {
                                                transitionProperty: 'width',
                                            },
                                        }}
                                        colorScheme="green"
                                        hasStripe={!done}
                                        isAnimated={!done}
                                    />
                                </GridItem>
                                <GridItem mx="-0.2rem" colSpan={1}>
                                    <Icon
                                        sx={{
                                            transition: '0.3s ease-out',
                                            transform: done ? 'scale(1.5)' : 'scale(1)',
                                        }}
                                        as={AiFillCheckCircle}
                                        color="green.500"
                                        w={8}
                                        h={8}
                                        visibility={done ? 'visible' : 'hidden'}
                                    />
                                </GridItem>
                            </SimpleGrid>
                        </Tooltip>
                        <FormProvider {...methods}>
                            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                            <form data-cy="profile-form" id="profile-form" onSubmit={handleSubmit(submitForm)}>
                                <FormControl>
                                    <InputGroup>
                                        <Input
                                            data-cy="profile-alt-email"
                                            type="email"
                                            placeholder={isNorwegian ? 'Alternativ e-post' : 'Alternate email'}
                                            onInput={() =>
                                                setProfileState({
                                                    ...profileState,
                                                    infoState: 'edited',
                                                    errorMessage: null,
                                                })
                                            }
                                            mb="1rem"
                                            {...register('alternateEmail')}
                                        />
                                        <InputRightAddon>
                                            <Tooltip label="Denne vil bli brukt i stedet for studentmailen din når du melder deg på et arrangement">
                                                <span>
                                                    <Icon as={BsQuestion} p="0.1rem" w={8} h={8} />
                                                </span>
                                            </Tooltip>
                                        </InputRightAddon>
                                    </InputGroup>
                                </FormControl>
                                <FormDegree
                                    data-cy="profile-degree"
                                    hideLabel
                                    onInput={() =>
                                        setProfileState({ ...profileState, infoState: 'edited', errorMessage: null })
                                    }
                                    placeholder={isNorwegian ? 'Studieretning' : 'Field of study'}
                                    py="1rem"
                                />
                                <FormDegreeYear
                                    data-cy="profile-degree-year"
                                    hideLabel
                                    onInput={() =>
                                        setProfileState({ ...profileState, infoState: 'edited', errorMessage: null })
                                    }
                                    placeholder={isNorwegian ? 'Årstrinn' : 'Year of study'}
                                    py="1rem"
                                />
                                <HStack mt={4} gap={4}>
                                    <Button
                                        disabled={
                                            profileState.infoState !== 'edited' && profileState.infoState !== 'error'
                                        }
                                        isLoading={profileState.infoState === 'saving'}
                                        type="submit"
                                        form="profile-form"
                                        colorScheme="teal"
                                        width="50%"
                                    >
                                        {profileState.infoState === 'saved'
                                            ? isNorwegian
                                                ? 'Endringer lagret!'
                                                : 'Changes saved!'
                                            : isNorwegian
                                            ? 'Lagre endringer'
                                            : 'Save changes'}
                                    </Button>
                                    <Button onClick={() => void signOut()} colorScheme="red" width="50%">
                                        {isNorwegian ? 'Logg ut' : 'Sign out'}
                                    </Button>
                                </HStack>
                            </form>
                        </FormProvider>
                        {user.memberships.includes('webkom') && (
                            <NextLink href="/dashboard" passHref>
                                <Button w="100%" as="a" colorScheme="blue" my="1rem">
                                    Til dashboard
                                </Button>
                            </NextLink>
                        )}
                    </Section>
                </GridItem>
            </SimpleGrid>
        </Center>
    );
};

export default ProfileInfo;
