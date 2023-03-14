import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm, FormProvider } from 'react-hook-form';
import { MdOutlineEmail } from 'react-icons/md';
import { BiGroup } from 'react-icons/bi';
import { CgProfile } from 'react-icons/cg';
import { IoIosAlert } from 'react-icons/io';
import {
    useToast,
    Center,
    Tooltip,
    Divider,
    Input,
    HStack,
    Heading,
    FormControl,
    InputGroup,
    InputRightAddon,
    Button,
    useColorModeValue,
    Alert,
    Text,
    Skeleton,
    LinkOverlay,
    AlertIcon,
    SimpleGrid,
    GridItem,
    Spinner,
    Icon,
    LinkBox,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { BsQuestion } from 'react-icons/bs';
import { isFuture } from 'date-fns';
import ProfileHappeningPreview from './profile-happening-preview';
import ErrorBox from '@components/error-box';
import capitalize from '@utils/capitalize';
import type { ProfileFormValues, User } from '@api/user';
import { UserAPI, userIsComplete } from '@api/user';
import { isErrorMessage } from '@utils/error';
import FormDegree from '@components/form-degree';
import Unauthorized from '@components/unauthorized';
import FormDegreeYear from '@components/form-degree-year';
import IconText from '@components/icon-text';
import Section from '@components/section';
import useLanguage from '@hooks/use-language';
import useAuth from '@hooks/use-auth';
import type { Happening } from '@api/happening';
import { HappeningAPI } from '@api/happening';
import { RegistrationAPI } from '@api/registration';
import hasOverlap from '@utils/has-overlap';

const ProfileInfo = () => {
    const { user, loading: userLoading, error, signedIn, setUser, idToken } = useAuth();
    const [loading, setLoading] = useState<boolean>(userLoading);

    const [saved, setSaved] = useState<boolean>(false);
    const [satisfied, setSatisfied] = useState<boolean>(false);

    const [happenings, setHappenings] = useState<Array<Happening>>([]);
    const [registrations, setRegistrations] = useState<Array<string>>();

    const isNorwegian = useLanguage();
    const methods = useForm<ProfileFormValues>({
        defaultValues: {
            degree: user?.degree ?? null,
            degreeYear: user?.degreeYear ?? null,
            alternateEmail: user?.alternateEmail ?? null,
        },
    });
    const { handleSubmit, register, setValue } = methods;
    const toast = useToast();
    const iconColor = useColorModeValue('black', 'white');

    useEffect(() => {
        if (signedIn && user) {
            setValue('degree', user.degree);
            setValue('degreeYear', user.degreeYear);
            setValue('alternateEmail', user.alternateEmail);

            setSatisfied(userIsComplete(user));
            setLoading(false);
        }
    }, [user, signedIn, setValue]);

    useEffect(() => {
        const fetchUserRegistrationSlugs = async () => {
            if (!user?.email || !idToken) return;

            const email = user.email;
            const res = await RegistrationAPI.getUserRegistrations(email, idToken);
            if (isErrorMessage(res)) {
                toast({
                    title: isNorwegian ? 'Det har skjedd en feil' : 'Something went wrong',
                    description: res.message,
                    status: 'error',
                    duration: 8000,
                    isClosable: true,
                });
                setLoading(false);
                return;
            } else {
                setRegistrations(res);
            }
        };

        void fetchUserRegistrationSlugs();
    }, [user]);

    useEffect(() => {
        if (registrations) {
            const fetchHappeningInfo = async () => {
                const res = await HappeningAPI.getHappeningsBySlugs(registrations);
                if (isErrorMessage(res)) {
                    toast({
                        title: isNorwegian ? 'Det har skjedd en feil' : 'Something went wrong',
                        description: res.message,
                        status: 'error',
                        duration: 8000,
                        isClosable: true,
                    });
                    setLoading(false);
                    return;
                } else {
                    setHappenings(res);
                }
            };
            void fetchHappeningInfo();
        }
    }, [registrations]);

    const submitForm: SubmitHandler<ProfileFormValues> = async (profileFormVals: ProfileFormValues) => {
        if (!user || !idToken || !signedIn) {
            toast({
                title: isNorwegian ? 'Du er ikke logget inn' : 'You are not signed in',
                description: isNorwegian ? 'Vennligst prøv på nytt' : 'Please try again',
                status: 'error',
                duration: 8000,
                isClosable: true,
            });
            return;
        }

        setLoading(true);

        const newUser: User = {
            email: user.email,
            name: user.name,
            alternateEmail: profileFormVals.alternateEmail === '' ? null : profileFormVals.alternateEmail,
            degree: profileFormVals.degree,
            degreeYear: profileFormVals.degreeYear,
            memberships: [],
            strikes: user.strikes,
            createdAt: new Date(),
            modifiedAt: new Date(),
        };

        const res = await UserAPI.putUser(newUser, idToken);

        if (isErrorMessage(res)) {
            toast({
                title: isNorwegian ? 'Det har skjedd en feil' : 'Something went wrong',
                description: res.message,
                status: 'error',
                duration: 8000,
                isClosable: true,
            });
            setLoading(false);
            return;
        }

        setUser(res);
        setSaved(true);
        setLoading(false);
    };

    if (error) {
        return error.message === '401' ? <Unauthorized /> : <ErrorBox error={error.message} />;
    }

    if (!signedIn || !user) return <Unauthorized />;

    const bedpress = happenings
        .filter((event: Happening) => {
            return event.happeningType === 'BEDPRES';
        })
        .sort((a: Happening, b: Happening) => {
            if (new Date(a.date) > new Date(b.date)) return 1;
            else if (new Date(a.date) < new Date(b.date)) return -1;
            else return 0;
        });

    const events = happenings
        .filter((event: Happening) => {
            return event.happeningType === 'EVENT';
        })
        .sort((a: Happening, b: Happening) => {
            if (new Date(a.date) > new Date(b.date)) return 1;
            else if (new Date(a.date) < new Date(b.date)) return -1;
            else return 0;
        });

    return (
        <Skeleton isLoaded={!userLoading}>
            <Center>
                <SimpleGrid columns={2} gap={4} w={['95%', '90%', '80%', '60%']}>
                    <GridItem colSpan={2}>
                        <Section>
                            <Center mb="1rem">
                                <Heading size={['xl', null, '2xl']}>
                                    {isNorwegian ? 'Min profil' : 'My profile'}
                                </Heading>
                            </Center>
                            <Divider my="1rem" />
                            <IconText iconColor={iconColor} data-cy="profile-name" icon={CgProfile} text={user.name} />
                            <IconText
                                iconColor={iconColor}
                                data-cy="profile-email"
                                icon={MdOutlineEmail}
                                text={user.email}
                            />
                            {user.memberships.length > 0 && (
                                <IconText
                                    iconColor={iconColor}
                                    icon={BiGroup}
                                    text={user.memberships.map((m: string) => capitalize(m)).join(', ')}
                                />
                            )}
                            {user.strikes !== 0 && (
                                <HStack>
                                    <IconText
                                        data-cy="profile-strikes"
                                        icon={IoIosAlert}
                                        text={
                                            isNorwegian ? 'Antall prikker (bedpres): ' : 'Number of strikes (bedpres): '
                                        }
                                    />
                                    <Text>{user.strikes}</Text>
                                </HStack>
                            )}
                        </Section>
                    </GridItem>
                    <GridItem colSpan={2}>
                        <Section>
                            {!satisfied && (
                                <Skeleton isLoaded={!loading}>
                                    <Alert status="warning" borderRadius="0.5rem" mb="6">
                                        <AlertIcon />
                                        {isNorwegian
                                            ? 'Du må fylle ut all nødvendig informasjon for å kunne melde deg på arrangementer!'
                                            : 'You must fill out all required information to be able to sign up for events!'}
                                    </Alert>
                                </Skeleton>
                            )}
                            <FormProvider {...methods}>
                                {/* eslint-disable @typescript-eslint/no-misused-promises */}
                                <form
                                    data-cy="profile-form"
                                    id="profile-form"
                                    onSubmit={handleSubmit(submitForm)}
                                    onChange={() => setSaved(false)}
                                >
                                    {/* eslint-enable @typescript-eslint/no-misused-promises */}
                                    <FormControl>
                                        <InputGroup>
                                            <Input
                                                data-cy="profile-alt-email"
                                                type="email"
                                                placeholder={isNorwegian ? 'Alternativ e-post' : 'Alternate email'}
                                                mb="1rem"
                                                {...register('alternateEmail')}
                                            />
                                            <InputRightAddon>
                                                <Tooltip
                                                    label={
                                                        isNorwegian
                                                            ? 'Denne vil bli brukt i stedet for studentmailen din når du melder deg på et arrangement'
                                                            : 'Your alternate email will be used instead of your student email when you sign up for an event.'
                                                    }
                                                >
                                                    <span>
                                                        <Icon as={BsQuestion} p="0.1rem" w={8} h={8} />
                                                    </span>
                                                </Tooltip>
                                            </InputRightAddon>
                                        </InputGroup>
                                    </FormControl>
                                    <FormDegree data-cy="profile-degree" hideLabel py="1rem" />
                                    <FormDegreeYear data-cy="profile-degree-year" hideLabel py="1rem" />
                                    <HStack mt={4} gap={4}>
                                        <Button
                                            isLoading={loading}
                                            disabled={saved}
                                            type="submit"
                                            form="profile-form"
                                            colorScheme="teal"
                                            width="50%"
                                        >
                                            {loading && <Spinner />}
                                            {saved && !loading
                                                ? isNorwegian
                                                    ? 'Endringer lagret!'
                                                    : 'Changes saved!'
                                                : isNorwegian
                                                ? 'Lagre endringer'
                                                : 'Save changes'}
                                        </Button>
                                        <Button
                                            data-cy="sign-out-btn"
                                            onClick={() => void signOut()}
                                            colorScheme="red"
                                            width="50%"
                                        >
                                            {isNorwegian ? 'Logg ut' : 'Sign out'}
                                        </Button>
                                    </HStack>
                                </form>
                            </FormProvider>
                            {hasOverlap(user.memberships, ['webkom', 'bedkom']) && (
                                <LinkBox>
                                    <LinkOverlay as={NextLink} href="/dashboard">
                                        <Button w="100%" as="a" colorScheme="blue" my="1rem">
                                            Til dashboard
                                        </Button>
                                    </LinkOverlay>
                                </LinkBox>
                            )}
                        </Section>
                    </GridItem>
                    <GridItem colSpan={2}>
                        <Section>
                            <Center mb="1rem">
                                <Heading size={['m', null, 'l']}>
                                    {isNorwegian ? 'Kommende arrangamenter' : 'Upcoming events'}
                                </Heading>
                            </Center>
                            {events.length > 0 ? (
                                events.map((event) => {
                                    if (isFuture(new Date(event.date))) {
                                        return (
                                            <ProfileHappeningPreview
                                                key={event.slug}
                                                isBedpres={false}
                                                event={event}
                                                data-testid={event.slug}
                                            />
                                        );
                                    }
                                })
                            ) : (
                                <Center>
                                    {isNorwegian ? 'Ingen kommende arrangementer :(' : 'No upcoming events :('}
                                </Center>
                            )}
                        </Section>
                    </GridItem>
                    <GridItem colSpan={2}>
                        <Section>
                            <Center mb="1rem">
                                <Heading size={['m', null, 'l']}>
                                    {isNorwegian ? 'Kommende bedriftspresentasjoner' : 'Upcoming bedpres'}
                                </Heading>
                            </Center>
                            {bedpress.length > 0 ? (
                                bedpress.map((event) => {
                                    if (isFuture(new Date(event.date))) {
                                        return (
                                            <ProfileHappeningPreview
                                                key={event.slug}
                                                isBedpres={true}
                                                event={event}
                                                data-testid={event.slug}
                                            />
                                        );
                                    }
                                })
                            ) : (
                                <Center>
                                    {isNorwegian
                                        ? 'Ingen kommende bedriftspresentasjoner :('
                                        : 'No upcoming bedpres :('}
                                </Center>
                            )}
                        </Section>
                    </GridItem>
                </SimpleGrid>
            </Center>
        </Skeleton>
    );
};

export default ProfileInfo;
