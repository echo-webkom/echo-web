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
import { useContext, useRef } from 'react';
import NextLink from 'next/link';
import type { SubmitHandler } from 'react-hook-form';
import { FormProvider, useForm } from 'react-hook-form';
import type { Happening, HappeningType, Question } from '@api/happening';
import type { RegFormValues } from '@api/registration';
import { User, UserAPI } from '@api/user';
import { RegistrationAPI } from '@api/registration';
import FormTerm from '@components/form-term';
import FormQuestion from '@components/form-question';
import FormDegree from '@components/form-degree';
import FormDegreeYear from '@components/form-degree-year';
import fullNameToSplitName from '@utils/full-name-to-split-name';
import LanguageContext from 'language-context';

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
    const { isOpen, onOpen, onClose } = useDisclosure();
    const isNorwegian = useContext(LanguageContext);
    const linkColor = useColorModeValue('blue', 'blue.400');
    const methods = useForm<RegFormValues>();
    const { register, handleSubmit } = methods;

    const toast = useToast();

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
                onClose();
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
            {!påmeldt && (
                <Button data-cy="reg-btn" w="100%" colorScheme="teal" onClick={onOpen}>
                    {isNorwegian ? 'Påmelding' : 'Register'}
                </Button>
            )}
            {påmeldt && (
                <Button
                    data-cy="del-btn"
                    w="100%"
                    colorScheme="red"
                    onClick={() => RegistrationAPI.deleteRegistration(happening.slug, user.email)}
                >
                    {isNorwegian ? 'Meld deg av' : 'Unregister'}
                </Button>
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
                                <Button onClick={onClose}>{isNorwegian ? 'Lukk' : 'Close'}</Button>
                            </ModalFooter>
                        </form>
                    </FormProvider>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default RegistrationForm;
