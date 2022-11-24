/* eslint-disable @typescript-eslint/no-misused-promises */

import { useState, useContext, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm, FormProvider } from 'react-hook-form';
import { MdOutlineEmail } from 'react-icons/md';
import { BiGroup } from 'react-icons/bi';
import { CgProfile } from 'react-icons/cg';
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
    Skeleton,
    AlertIcon,
    SimpleGrid,
    GridItem,
    Icon,
    Spinner,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { BsQuestion } from 'react-icons/bs';
import ErrorBox from './error-box';
import capitalize from '@utils/capitalize';
import type { ProfileFormValues, User } from '@api/user';
import { UserAPI, userIsComplete } from '@api/user';
import { isErrorMessage } from '@utils/error';
import type { ErrorMessage } from '@utils/error';
import FormDegree from '@components/form-degree';
import FormDegreeYear from '@components/form-degree-year';
import IconText from '@components/icon-text';
import Section from '@components/section';
import LanguageContext from 'language-context';

const ProfileInfo = (): JSX.Element => {
    const [user, setUser] = useState<User | null>();
    const [error, setError] = useState<ErrorMessage>();
    const [loading, setLoading] = useState<boolean>(true);

    const [saved, setSaved] = useState<boolean>(false);
    const [satisfied, setSatisfied] = useState<boolean>(false);

    const isNorwegian = useContext(LanguageContext);
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

    const { data, status } = useSession();

    useEffect(() => {
        const fetchUser = async () => {
            if (!data?.idToken || !data.user?.email || !data.user.name) return;

            const result = await UserAPI.getUser(data.user.email, data.user.name, data.idToken);

            if (isErrorMessage(result)) {
                setError(result);
            } else {
                setUser(result);
            }
        };

        void fetchUser();
    }, [data]);

    useEffect(() => {
        if (user) {
            setValue('degree', user.degree);
            setValue('degreeYear', user.degreeYear);
            setValue('alternateEmail', user.alternateEmail);

            setSatisfied(userIsComplete(user));
            setLoading(false);
        }
    }, [user, setValue]);

    const submitForm: SubmitHandler<ProfileFormValues> = async (profileFormVals: ProfileFormValues) => {
        if (!user || status !== 'authenticated') {
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
        };

        const res = await UserAPI.putUser(newUser, data.idToken);

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

    if (loading && !user)
        return (
            <Center>
                <Spinner />
            </Center>
        );

    if (error) return <ErrorBox error={`${error.message}`} />;

    if (!user) return <ErrorBox error="Det har skjedd en feil." />;

    return (
        <Center>
            <SimpleGrid columns={2} gap={4} w={['95%', '90%', '80%', '60%']}>
                <GridItem colSpan={2}>
                    <Section>
                        <Center mb="1rem">
                            <Heading size={['xl', null, '2xl']}>{isNorwegian ? 'Min profil' : 'My profile'}</Heading>
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
                    </Section>
                </GridItem>
                <GridItem colSpan={2}>
                    <Section>
                        {!satisfied && (
                            <Skeleton isLoaded={!loading}>
                                <Alert status="warning" borderRadius="0.5rem" mb="6">
                                    <AlertIcon />
                                    Du må fylle ut all nødvendig informasjon for å kunne melde deg på arrangementer!
                                </Alert>
                            </Skeleton>
                        )}
                        <FormProvider {...methods}>
                            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                            <form
                                data-cy="profile-form"
                                id="profile-form"
                                onSubmit={handleSubmit(submitForm)}
                                onChange={() => setSaved(false)}
                            >
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
                                        {saved
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
