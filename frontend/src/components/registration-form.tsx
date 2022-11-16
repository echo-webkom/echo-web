import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Link,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    useColorModeValue,
    useDisclosure,
    useToast,
    VStack,
    Wrap,
} from '@chakra-ui/react';
import { useContext, useEffect, useRef, useState } from 'react';
import NextLink from 'next/link';
import type { SubmitHandler } from 'react-hook-form';
import { FormProvider, useForm } from 'react-hook-form';
import { Happening, HappeningAPI, HappeningType, Question } from '@api/happening';
import { RegFormValues, registrationDecoder } from '@api/registration';
import { User, UserAPI } from '@api/user';
import { RegistrationAPI } from '@api/registration';
import FormTerm from '@components/form-term';
import FormQuestion from '@components/form-question';
import FormDegree from '@components/form-degree';
import FormDegreeYear from '@components/form-degree-year';
import fullNameToSplitName from '@utils/full-name-to-split-name';
import LanguageContext from 'language-context';
import { isErrorMessage } from '@utils/error';

const codeToStatus = (statusCode: number): 'success' | 'warning' | 'error' | 'info' | undefined => {
    switch (statusCode) {
        // OK
        // The registration is submitted.
        case 200: {
            return 'success';
        }

        // ACCEPTED
        // The bedpres spots are filled up,
        // and the user is placed on the waitlist.
        case 202: {
            return 'warning';
        }

        // BAD_REQUEST
        // The form has bad or invalid data.
        case 400: {
            return 'warning';
        }

        // FORBIDDEN
        // User submits registration before bedpres is open (shouldn't be possible).
        case 403: {
            return 'warning';
        }

        // CONFLICT
        // The bedpres the user is trying to sign up for does not exist.
        case 409: {
            return 'error';
        }

        // UNPROCESSABLE_ENTITY
        // The registration already exists.
        case 422: {
            return 'warning';
        }

        // INTERNAL_SERVER_ERROR
        // Something has gone horribly wrong.
        default: {
            return 'error';
        }
    }
};

interface Props {
    happening: Happening;
    regVerifyToken: string | null;
    type: HappeningType;
    backendUrl: string;
    user: User | null;
}

const RegistrationForm = ({ happening, regVerifyToken, type, backendUrl, user }: Props): JSX.Element => {
    const påmeldt: boolean = true;
    const { isOpen: isRegisterOpen, onOpen: onRegisterOpen, onClose: onRegisterClose } = useDisclosure();
    const { isOpen: isUnRegisterOpen, onOpen: onUnRegisterOpen, onClose: onUnRegisterClose } = useDisclosure();

    const isNorwegian = useContext(LanguageContext);
    const linkColor = useColorModeValue('blue', 'blue.400');
    const methods = useForm<RegFormValues>();
    const { register, handleSubmit } = methods;

    const toast = useToast();
    const [registered, setRegistered] = useState(false);

    useEffect(() => {
        const fetchIsRegistered = async () => {
            if (user) {
                const isRegistered = await HappeningAPI.getUserIsRegistered(user.email, happening.slug);
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
    }, []);

    const initialRef = useRef<HTMLInputElement | null>(null);
    const { ref, ...rest } = register('email'); // needed for inital focus ref

    const [firstName, lastName] = user && user.name !== '' ? fullNameToSplitName(user.name) : [undefined, undefined];

    const submitForm: SubmitHandler<RegFormValues> = async (data) => {
        await RegistrationAPI.submitRegistration(
            {
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                degree: data.degree,
                degreeYear: data.degreeYear,
                slug: happening.slug,
                terms: data.terms1 && data.terms2 && data.terms3,
                answers: happening.additionalQuestions.map((q: Question, index: number) => {
                    return { question: q.questionText, answer: data.answers[index] };
                }),
                type: type,
                regVerifyToken,
            },
            backendUrl,
        ).then(({ response, statusCode }) => {
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
        });
    };

    return (
        <Box data-testid="bedpres-form">
            {/* {!user && <>Meld deg på med feide!</>} */}
            {!registered && (
                <Button data-cy="reg-btn" w="100%" colorScheme="teal" onClick={onRegisterOpen}>
                    {isNorwegian ? 'Påmelding' : 'Register'}
                </Button>
            )}
            {registered && (
                <Button data-cy="del-btn" w="100%" colorScheme="red" onClick={onUnRegisterOpen}>
                    {isNorwegian ? 'Meld deg av' : 'Unregister'}
                </Button>
            )}

            <Modal initialFocusRef={initialRef} isOpen={isRegisterOpen} onClose={onRegisterClose}>
                <ModalOverlay />
                <ModalContent mx="2" minW={['275px', '500px', null, '700px']}>
                    <FormProvider {...methods}>
                        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                        <form data-cy="reg-form" onSubmit={handleSubmit(submitForm)}>
                            <ModalHeader>{isNorwegian ? 'Påmelding' : 'Registration'}</ModalHeader>
                            <ModalCloseButton />
                            <ModalBody pb="8px">
                                <VStack spacing={4}>
                                    <FormControl id="email" isRequired>
                                        <FormLabel>{isNorwegian ? 'E-post' : 'Email'}</FormLabel>
                                        <Input
                                            type="email"
                                            defaultValue={user?.alternateEmail ?? user?.email}
                                            {...rest}
                                            // using multiple refs
                                            ref={(e) => {
                                                ref(e);
                                                initialRef.current = e;
                                            }}
                                        />
                                    </FormControl>
                                    <FormControl id="firstName" isRequired>
                                        <FormLabel>{isNorwegian ? 'Fornavn' : 'First name'}</FormLabel>
                                        <Input defaultValue={firstName} {...register('firstName')} />
                                    </FormControl>
                                    <FormControl id="lastName" isRequired>
                                        <FormLabel>{isNorwegian ? 'Etternavn' : 'Last name'}</FormLabel>
                                        <Input defaultValue={lastName} {...register('lastName')} />
                                    </FormControl>
                                    <FormDegree defaultValue={user?.degree?.toString()} />
                                    <FormDegreeYear defaultValue={user?.degreeYear ?? undefined} />
                                    {happening.additionalQuestions.map((q: Question, index: number) => {
                                        return (
                                            <FormQuestion key={`q.questionText-${q.inputType}`} q={q} index={index} />
                                        );
                                    })}
                                    <FormTerm id="terms1">
                                        <Text ml="0.5rem" fontWeight="bold">
                                            {isNorwegian
                                                ? 'Jeg bekrefter at jeg har fylt inn riktig informasjon.'
                                                : 'I confirm that I have filled in the correct information.'}
                                        </Text>
                                    </FormTerm>
                                    <FormTerm id="terms2">
                                        <Text ml="0.5rem" fontWeight="bold">
                                            {isNorwegian
                                                ? `Jeg er klar over at hvis jeg ikke møter opp risikerer jeg å bli
                                                utestengt fra fremtidige 
                                                ${type === 'BEDPRES' ? 'bedriftspresentasjoner' : 'arrangementer'}.`
                                                : `I am aware that if I do not show up I risk being 
                                                banned from future  
                                                ${type === 'BEDPRES' ? 'company presentasjoner' : 'events'}.`}
                                        </Text>
                                    </FormTerm>
                                    <FormTerm id="terms3">
                                        <Text ml="0.5rem" fontWeight="bold">
                                            {type === 'BEDPRES' ? (
                                                <Wrap spacing={0}>
                                                    <Text ml="0.5rem" fontWeight="bold">
                                                        {isNorwegian
                                                            ? 'Jeg har lest gjennom og forstått'
                                                            : 'I have read through and understood'}
                                                    </Text>
                                                    <NextLink href="https://bit.ly/bedkom-faq2" passHref>
                                                        <Link href="https://bit.ly/bedkom-faq2" isExternal>
                                                            <Text color={linkColor} ml="0.5rem" fontWeight="bold">
                                                                {isNorwegian
                                                                    ? 'Bedkom sine retningslinjer'
                                                                    : "Bedkom's guidelines"}
                                                            </Text>
                                                        </Link>
                                                    </NextLink>
                                                    <Text ml="0.5rem" fontWeight="bold">
                                                        .
                                                    </Text>
                                                </Wrap>
                                            ) : (
                                                <Text ml="0.5rem" fontWeight="bold">
                                                    {isNorwegian
                                                        ? `Jeg er klar over at jeg må melde meg av innen 24 timer før
                                                        arrangementet, dersom jeg ikke kan møte opp.`
                                                        : `I am aware that I must cancel within 24 hours before the event, if I cannot attend`}
                                                </Text>
                                            )}
                                        </Text>
                                    </FormTerm>
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
            <Modal initialFocusRef={initialRef} isOpen={isUnRegisterOpen} onClose={onUnRegisterClose}>
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
                                <Input />
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
                                if (user) {
                                    RegistrationAPI.deleteRegistration(happening.slug, user.email);
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
