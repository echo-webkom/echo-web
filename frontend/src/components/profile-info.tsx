import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { FormProvider, useForm } from 'react-hook-form';
import { MdOutlineEmail } from 'react-icons/md';
import { BiGroup } from 'react-icons/bi';
import { CgProfile } from 'react-icons/cg';
import { IoIosAlert } from 'react-icons/io';
import {
    useToast,
    Center,
    Divider,
    HStack,
    Heading,
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
    LinkBox,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { isFuture } from 'date-fns';
import ProfileHappeningPreview from './profile-happening-preview';
import FormAlternativeEmail from './form-alternative-email';
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

    const [upcomingEvents, setUpcomingEvents] = useState<Array<Happening>>([]);
    const [upcomingBedpresses, setUpcomingBedpresses] = useState<Array<Happening>>([]);

    const isNorwegian = useLanguage();
    const form = useForm<ProfileFormValues>({
        defaultValues: {
            degree: user?.degree ?? null,
            degreeYear: user?.degreeYear ?? null,
            alternateEmail: user?.alternateEmail ?? null,
        },
    });
    const toast = useToast();
    const iconColor = useColorModeValue('black', 'white');

    useEffect(() => {
        if (signedIn && user) {
            form.setValue('degree', user.degree);
            form.setValue('degreeYear', user.degreeYear);
            form.setValue('alternateEmail', user.alternateEmail);

            setSatisfied(userIsComplete(user));
            setLoading(false);
        }
    }, [user, signedIn, form]);

    useEffect(() => {
        const fetchUpcomingEvents = async () => {
            if (!user?.email || !idToken) return;

            const registrations = await RegistrationAPI.getUserRegistrations(user.email, idToken);
            if (isErrorMessage(registrations)) return;

            const eventSlugs = registrations.map((registration) => registration.slug);

            const happenings = await HappeningAPI.getHappeningsBySlugs(eventSlugs);
            if (isErrorMessage(happenings)) return;

            const upcomingEvents = happenings.filter((happening) => {
                return isFuture(new Date(happening.date));
            });

            const bedpress = upcomingEvents.filter((event) => {
                return event.happeningType === 'BEDPRES';
            });

            const events = upcomingEvents.filter((event) => {
                return event.happeningType === 'EVENT';
            });

            setUpcomingEvents(events);
            setUpcomingBedpresses(bedpress);
        };

        void fetchUpcomingEvents();
    }, [idToken, user?.email]);

    const onSubmit = form.handleSubmit(async (profileFormVals) => {
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
    });

    if (error) {
        return error.message === '401' ? <Unauthorized /> : <ErrorBox error={error.message} />;
    }

    if (!signedIn || !user) return <Unauthorized />;

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
                            <FormProvider {...form}>
                                <form
                                    data-cy="profile-form"
                                    id="profile-form"
                                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                                    onSubmit={onSubmit}
                                    onChange={() => setSaved(false)}
                                >
                                    <FormAlternativeEmail data-cy="profile-alt-email" py="1rem" />
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
                                    {isNorwegian ? 'Kommende arrangementer' : 'Upcoming events'}
                                </Heading>
                            </Center>
                            {upcomingEvents.length > 0 ? (
                                upcomingEvents.map((event) => {
                                    return (
                                        <ProfileHappeningPreview
                                            key={event.slug}
                                            event={event}
                                            data-testid={event.slug}
                                        />
                                    );
                                })
                            ) : (
                                <Center>
                                    {isNorwegian
                                        ? 'Du er ikke påmeldt noen kommende arrangementer'
                                        : 'You are not registered for any upcoming events'}
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
                            {upcomingBedpresses.length > 0 ? (
                                upcomingBedpresses.map((bedpres) => {
                                    return (
                                        <ProfileHappeningPreview
                                            key={bedpres.slug}
                                            event={bedpres}
                                            data-testid={bedpres.slug}
                                        />
                                    );
                                })
                            ) : (
                                <Center>
                                    {isNorwegian
                                        ? 'Du er ikke påmeldt noen kommende bedpreser'
                                        : 'You are not registered for any upcoming bedpres'}
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
