import {
    Alert,
    AlertIcon,
    Box,
    Button,
    Center,
    Flex,
    Input,
    LinkBox,
    LinkOverlay,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Text,
    useDisclosure,
    useToast,
    VStack,
} from '@chakra-ui/react';
import va from '@vercel/analytics';
import { differenceInHours, format, isBefore } from 'date-fns';
import { enUS, nb } from 'date-fns/locale';
import NextLink from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { FormProvider, useForm } from 'react-hook-form';
import { MdOutlineArrowForward } from 'react-icons/md';
import DeregistrationButton from './deregistration-button';
import type { Happening, HappeningType, Question } from '@api/happening';
import type { RegFormValues, UserRegistration } from '@api/registration';
import { RegistrationAPI } from '@api/registration';
import { userIsComplete } from '@api/user';
import CountdownButton from '@components/countdown-button';
import FormQuestion from '@components/form-question';
import useAuth from '@hooks/use-auth';
import useLanguage from '@hooks/use-language';
import capitalize from '@utils/capitalize';
import chooseDate from '@utils/choose-date';
import { isErrorMessage } from '@utils/error';
import hasOverlap from '@utils/has-overlap';

const codeToStatus = (statusCode: number): 'success' | 'warning' | 'error' => {
    if (statusCode === 200) return 'success';
    if (statusCode === 202 || statusCode === 400 || statusCode === 422) return 'warning';
    return 'error';
};

interface Props {
    happening: Happening;
    type: HappeningType;
}

const RegistrationForm = ({ happening, type }: Props): JSX.Element => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const isNorwegian = useLanguage();
    const methods = useForm<RegFormValues>();
    const { register, handleSubmit } = methods;
    const { user, loading: userLoading, signedIn, idToken } = useAuth();
    const [loading, setLoading] = useState(false);

    const userIsEligibleForEarlyReg = hasOverlap(happening.studentGroups, user?.memberships);
    const regDate = chooseDate(
        happening.registrationDate,
        happening.studentGroupRegistrationDate,
        userIsEligibleForEarlyReg,
    );

    const toast = useToast();
    const [registered, setRegistered] = useState(false);
    const [isWaitlist, setIsWaitlist] = useState(false);

    useEffect(() => {
        const fetchIsRegistered = async () => {
            if (!user || !idToken) {
                setRegistered(false);
                return;
            }
            const userRegistrations = await RegistrationAPI.getUserRegistrations(user.email, idToken);

            if (isErrorMessage(userRegistrations)) {
                setRegistered(false);
                return;
            }

            const slugRegistrations = userRegistrations.filter((r: UserRegistration) => r.slug === happening.slug);

            if (slugRegistrations.length > 0) {
                setRegistered(true);
                setIsWaitlist(slugRegistrations[0].status === 'WAITLIST');
            } else {
                setRegistered(false);
                return;
            }
        };
        void fetchIsRegistered();
    }, [user, registered, idToken, happening.slug]);

    const initialRef = useRef<HTMLInputElement | null>(null);

    const submitForm: SubmitHandler<RegFormValues> = async (data) => {
        if (!signedIn || !idToken) {
            toast({
                title: isNorwegian ? 'Du er ikke logget inn.' : 'You are not signed in.',
                description: isNorwegian ? 'Logg inn for å melde deg på.' : 'Sign in to register.',
                status: 'warning',
            });
            return;
        }

        setLoading(true);

        const { response, statusCode } = await RegistrationAPI.submitRegistration(
            {
                email: data.email,
                slug: happening.slug,
                answers: happening.additionalQuestions.map((q: Question, index: number) => {
                    return { question: q.questionText, answer: data.answers[index] };
                }),
                type: type,
            },
            idToken,
        );

        setLoading(false);

        if (statusCode === 200 || statusCode === 202) {
            va.track('Successful registration');
            onClose();
        } else {
            va.track('Unsuccessful registration');
        }

        toast.closeAll();
        toast({
            title: response.title,
            description: response.desc,
            status: codeToStatus(statusCode),
            duration: 8000,
            isClosable: true,
        });
    };

    if (userLoading || loading)
        return (
            <Box data-testid="registration-form">
                <Center>
                    <Spinner />
                </Center>
            </Box>
        );

    if (!signedIn)
        return (
            <Box data-testid="registration-form">
                <Text textAlign="center">{isNorwegian ? 'Logg inn for å melde deg på.' : 'Sign in to register.'}</Text>
            </Box>
        );

    if (
        !userIsEligibleForEarlyReg &&
        !happening.registrationDate &&
        happening.studentGroups &&
        happening.studentGroups.length > 0
    )
        return (
            <Box data-testid="registration-form">
                <Text textAlign="center">Kun åpen for {happening.studentGroups.map(capitalize).join(', ')}.</Text>
            </Box>
        );

    return (
        <Flex direction="column" gap="5" data-testid="registration-form">
            {!userIsComplete(user) && (
                <>
                    <Alert status="warning" borderRadius="0.5rem">
                        <AlertIcon />
                        {isNorwegian
                            ? 'Du må fylle ut all nødvendig informasjon for å kunne melde deg på arrangementer!'
                            : 'You must fill out all necessary information to be able to register for events!'}
                    </Alert>
                    <LinkBox>
                        <LinkOverlay as={NextLink} href="/profile">
                            <Button w="100%" rightIcon={<MdOutlineArrowForward />} colorScheme="teal" variant="outline">
                                Min profil
                            </Button>
                        </LinkOverlay>
                    </LinkBox>
                </>
            )}
            {userIsEligibleForEarlyReg && !happening.onlyForStudentGroups && (
                <Alert status="info" borderRadius="0.5rem">
                    <AlertIcon />
                    Du kan melde deg på dette arrangementet tidligere enn andre.
                </Alert>
            )}
            {happening.onlyForStudentGroups && (
                <Alert status="info" borderRadius="0.5rem">
                    <AlertIcon />
                    {isNorwegian ? 'Dette er et internt arrangement.' : 'This is a private event.'}
                </Alert>
            )}
            {isBefore(new Date(), regDate) && differenceInHours(regDate, new Date()) >= 24 && (
                <Center>
                    <Text fontSize="xl">
                        {isNorwegian ? `Påmelding åpner ` : `Registration opens `}
                        {format(regDate, 'dd. MMM HH:mm', {
                            locale: isNorwegian ? nb : enUS,
                        })}
                    </Text>
                </Center>
            )}
            {user?.strikes === 5 && happening.happeningType === 'BEDPRES' ? (
                <Alert status="error" borderRadius="0.5rem">
                    <AlertIcon />
                    {isNorwegian
                        ? `Du har 5 prikker og kan ikke melde deg på. Kontakt bedkom om dette er en feil. `
                        : `You have 5 strikes and can't register. Contact bedkom if this is incorrect. `}
                </Alert>
            ) : (
                userIsComplete(user) &&
                differenceInHours(regDate, new Date()) < 24 && (
                    <>
                        {registered && <DeregistrationButton happening={happening} isWaitlist={isWaitlist} />}
                        {!registered && (
                            <CountdownButton
                                data-cy="reg-btn"
                                w="100%"
                                colorScheme="teal"
                                date={regDate}
                                onClick={() =>
                                    happening.additionalQuestions.length === 0
                                        ? void submitForm({ email: user.email, answers: [] })
                                        : onOpen()
                                }
                            >
                                {isNorwegian ? 'Klikk for å melde deg på' : 'Click to register'}
                            </CountdownButton>
                        )}
                    </>
                )
            )}

            <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent mx="2" minW={['275px', '500px', null, '700px']}>
                    <FormProvider {...methods}>
                        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                        <form data-cy="reg-form" onSubmit={handleSubmit(submitForm)}>
                            <ModalHeader>{isNorwegian ? 'Påmelding' : 'Registration'}</ModalHeader>
                            <ModalCloseButton />
                            <ModalBody pb="8px">
                                <Input type="email" defaultValue={user?.email} {...register('email')} hidden />
                                <VStack spacing={4}>
                                    {happening.additionalQuestions.map((q: Question, index: number) => {
                                        return (
                                            <FormQuestion key={`q.questionText-${q.inputType}`} q={q} index={index} />
                                        );
                                    })}
                                </VStack>
                            </ModalBody>
                            <ModalFooter>
                                <Button type="submit" mr={3} colorScheme="teal">
                                    {isNorwegian ? 'Send inn' : 'Send in'}
                                </Button>
                                <Button onClick={onClose}>{isNorwegian ? 'Lukk' : 'Close'}</Button>
                            </ModalFooter>
                        </form>
                    </FormProvider>
                </ModalContent>
            </Modal>
        </Flex>
    );
};

export default RegistrationForm;
