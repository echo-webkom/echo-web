import {
    Box,
    Button,
    Text,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Input,
    useDisclosure,
    useToast,
    VStack,
    Spinner,
    Alert,
    AlertIcon,
    Center,
    FormControl,
    FormLabel,
    LinkBox,
    LinkOverlay,
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useContext, useEffect, useRef, useState } from 'react';

import type { SubmitHandler } from 'react-hook-form';
import { FormProvider, useForm } from 'react-hook-form';
import { MdOutlineArrowForward } from 'react-icons/md';
import { useState } from 'react';
import NextLink from 'next/link';
import { differenceInHours, format, isBefore, parseISO } from 'date-fns';
import { enUS, nb } from 'date-fns/locale';
import CountdownButton from '@components/countdown-button';
import { Happening, HappeningAPI, HappeningType, Question } from '@api/happening';
import { RegFormValues } from '@api/registration';
import { userIsComplete } from '@api/user';
import { RegistrationAPI } from '@api/registration';
import FormQuestion from '@components/form-question';
import useLanguage from '@hooks/use-language';
import hasOverlap from '@utils/has-overlap';
import capitalize from '@utils/capitalize';
import { isErrorMessage } from '@utils/error';
import useAuth from '@hooks/use-auth';

const codeToStatus = (statusCode: number): 'success' | 'warning' | 'error' => {
    if (statusCode === 200) return 'success';
    if (statusCode === 202 || statusCode === 400 || statusCode === 422) return 'warning';
    return 'error';
};

interface Props {
    happening: Happening;
    type: HappeningType;
}

const chooseDate = (
    regDate: string | null,
    studentGroupRegDate: string | null,
    userIsEligibleForEarlyReg: boolean,
): Date => {
    if (!regDate && !studentGroupRegDate) return new Date();
    if (!regDate && studentGroupRegDate) return userIsEligibleForEarlyReg ? parseISO(studentGroupRegDate) : new Date();
    if (regDate && !studentGroupRegDate) return parseISO(regDate);
    if (regDate && studentGroupRegDate) return parseISO(userIsEligibleForEarlyReg ? studentGroupRegDate : regDate);
    // Shouldn't be possible to reach this point, but TypeScript doesn't know that
    return new Date();
};

const RegistrationForm = ({ happening, type }: Props): JSX.Element => {
    const { isOpen: isRegisterOpen, onOpen: onRegisterOpen, onClose: onRegisterClose } = useDisclosure();
    const { isOpen: isUnRegisterOpen, onOpen: onUnRegisterOpen, onClose: onUnRegisterClose } = useDisclosure();
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
    const [reason, setReason] = useState('');

    useEffect(() => {
        const fetchIsRegistered = async () => {
            if (user && idToken) {
                const isRegistered = await RegistrationAPI.getUserIsRegistered(user.email, happening.slug, idToken);
                if (isErrorMessage(isRegistered)) {
                    setRegistered(false);
                    return;
                }
                setRegistered(isRegistered);

                return;
            }
            setRegistered(false);
        };
        void fetchIsRegistered();
    }, [user, registered]);

    const initialRef = useRef<HTMLInputElement | null>(null);
    const { ref, ...rest } = register('email'); // needed for inital focus ref

    const { data: session, status } = useSession();

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
            // signedIn === true implies idToken is not null. Fuck off typescript, jeg banker deg opp.
            idToken,
        );

        setLoading(false);

        if (statusCode === 200 || statusCode === 202) {
            onRegisterClose();
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
        <Box data-testid="registration-form">
            {!userIsComplete(user) && (
                <>
                    <Alert status="warning" borderRadius="0.5rem" mb="5">
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
                <Alert status="info" borderRadius="0.5rem" mb="5">
                    <AlertIcon />
                    Du kan melde deg på dette arrangementet tidligere enn andre.
                </Alert>
            )}
            {happening.onlyForStudentGroups && (
                <Alert status="info" borderRadius="0.5rem" mb="5">
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
            {userIsComplete(user) &&
                differenceInHours(regDate, new Date()) < 24 &&
                (registered ? (
                    <Button data-cy="del-btn" w="100%" colorScheme="red" onClick={onUnRegisterOpen}>
                        {isNorwegian ? 'Meld deg av' : 'Unregister'}
                    </Button>
                ) : (
                    <CountdownButton
                        data-cy="reg-btn"
                        w="100%"
                        colorScheme="teal"
                        date={regDate}
                        onClick={() =>
                            happening.additionalQuestions.length === 0
                                ? void submitForm({ email: user.email, answers: [] })
                                : onRegisterOpen()
                        }
                    >
                        {isNorwegian ? 'Klikk for å melde deg på' : 'Click to register'}
                    </CountdownButton>
                ))}

            <Modal initialFocusRef={initialRef} isOpen={isRegisterOpen} onClose={onRegisterClose}>
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
                                <Button onClick={onRegisterClose}>{isNorwegian ? 'Lukk' : 'Close'}</Button>
                            </ModalFooter>
                        </form>
                    </FormProvider>
                </ModalContent>
            </Modal>
            <Modal
                initialFocusRef={initialRef}
                isOpen={isUnRegisterOpen}
                onClose={() => {
                    onUnRegisterClose();
                    setReason('');
                }}
            >
                <ModalOverlay />
                <ModalContent mx="2" minW={['275px', '500px', null, '700px']}>
                    <ModalHeader>{isNorwegian ? 'Meld deg av' : 'Unregister'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb="8px">
                        {/* add input text for reasoning */}
                        <VStack spacing={4}>
                            <FormControl id="reason" isRequired>
                                <FormLabel>
                                    {isNorwegian ? 'Hvorfor melder du deg av?' : 'Why are you unregistering?'}
                                </FormLabel>
                                <Input
                                    placeholder={isNorwegian ? 'Grunn' : 'Reason'}
                                    onChange={(e) => {
                                        setReason(e.target.value);
                                    }}
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                    }}
                                />
                            </FormControl>

                            <Text ml="0.5rem" fontWeight="bold">
                                {isNorwegian
                                    ? 'Jeg bekrefter at jeg har fylt inn riktig informasjon.'
                                    : 'I confirm that I have filled in the correct information.'}
                            </Text>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            type="submit"
                            mr={3}
                            colorScheme="red"
                            onClick={() => {
                                onUnRegisterClose();
                                if (user && session?.idToken) {
                                    RegistrationAPI.deleteRegistration(session?.idToken, {
                                        slug: happening.slug,
                                        email: user.email,
                                        reason: reason,
                                    });
                                } else {
                                    toast({
                                        title: 'Error',
                                        description: 'You are not logged in',
                                        status: 'error',
                                        duration: 5000,
                                        isClosable: true,
                                    });
                                }
                            }}
                        >
                            {isNorwegian ? 'Ja' : 'Yes'}
                        </Button>
                        <Button onClick={onUnRegisterClose}>{isNorwegian ? 'Nei' : 'No'}</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default RegistrationForm;
