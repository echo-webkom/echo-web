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
import React, { useRef } from 'react';
import NextLink from 'next/link';
import { FormProvider, useForm, SubmitHandler } from 'react-hook-form';
import { UserWithName, Happening, HappeningType, RegistrationAPI, Question, RegFormValues } from '../lib/api';
import { fullNameToSplitName } from '../lib/utils';
import FormTerm from './form-term';
import FormQuestion from './form-question';
import FormDegree from './form-degree';
import FormDegreeYear from './form-degree-year';

const codeToStatus = (statusCode: number): 'success' | 'warning' | 'error' | 'info' | undefined => {
    switch (statusCode) {
        // OK
        // The registration is submitted.
        case 200:
            return 'success';

        // ACCEPTED
        // The bedpres spots are filled up,
        // and the user is placed on the waitlist.
        case 202:
            return 'warning';

        // BAD_REQUEST
        // The form has bad or invalid data.
        case 400:
            return 'warning';

        // FORBIDDEN
        // User submits registration before bedpres is open (shouldn't be possible).
        case 403:
            return 'warning';

        // CONFLICT
        // The bedpres the user is trying to sign up for does not exist.
        case 409:
            return 'error';

        // UNPROCESSABLE_ENTITY
        // The registration already exists.
        case 422:
            return 'warning';

        // INTERNAL_SERVER_ERROR
        // Something has gone horribly wrong.
        default:
            return 'error';
    }
};

interface Props {
    happening: Happening;
    regVerifyToken: string | null;
    type: HappeningType;
    backendUrl: string;
    user: UserWithName | null;
}

const RegistrationForm = ({ happening, regVerifyToken, type, backendUrl, user }: Props): JSX.Element => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const linkColor = useColorModeValue('blue', 'blue.400');
    const methods = useForm<RegFormValues>();
    const { register, handleSubmit } = methods;

    const toast = useToast();

    const initialRef = useRef<HTMLInputElement | null>(null);
    const { ref, ...rest } = register('email'); // needed for inital focus ref

    const [firstName, lastName] = user ? fullNameToSplitName(user.name) : [undefined, undefined];

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
            <Button data-cy="reg-btn" w="100%" colorScheme="teal" onClick={onOpen}>
                Påmelding
            </Button>

            <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent mx="2" minW={['275px', '500px', null, '700px']}>
                    <FormProvider {...methods}>
                        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                        <form data-cy="reg-form" onSubmit={handleSubmit(submitForm)}>
                            <ModalHeader>Påmelding</ModalHeader>
                            <ModalCloseButton />
                            <ModalBody pb="8px">
                                <VStack spacing={4}>
                                    <FormControl id="email" isRequired>
                                        <FormLabel>E-post</FormLabel>
                                        <Input
                                            type="email"
                                            defaultValue={user?.email}
                                            {...rest}
                                            // using multiple refs
                                            ref={(e) => {
                                                ref(e);
                                                initialRef.current = e;
                                            }}
                                        />
                                    </FormControl>
                                    <FormControl id="firstName" isRequired>
                                        <FormLabel>Fornavn</FormLabel>
                                        <Input defaultValue={firstName} {...register('firstName')} />
                                    </FormControl>
                                    <FormControl id="lastName" isRequired>
                                        <FormLabel>Etternavn</FormLabel>
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
                                            Jeg bekrefter at jeg har fylt inn riktig informasjon.
                                        </Text>
                                    </FormTerm>
                                    <FormTerm id="terms2">
                                        <Text ml="0.5rem" fontWeight="bold">
                                            {`Jeg er klar over at hvis jeg ikke møter opp risikerer jeg å bli
                                                utestengt fra fremtidige 
                                                ${
                                                    type === HappeningType.BEDPRES
                                                        ? 'bedriftspresentasjoner'
                                                        : 'arrangementer'
                                                }.`}
                                        </Text>
                                    </FormTerm>
                                    <FormTerm id="terms3">
                                        <Text ml="0.5rem" fontWeight="bold">
                                            {type === HappeningType.BEDPRES ? (
                                                <Wrap spacing={0}>
                                                    <Text ml="0.5rem" fontWeight="bold">
                                                        Jeg har lest gjennom og forstått
                                                    </Text>
                                                    <NextLink href="https://bit.ly/bedkom-faq2" passHref>
                                                        <Link href="https://bit.ly/bedkom-faq2" isExternal>
                                                            <Text color={linkColor} ml="0.5rem" fontWeight="bold">
                                                                Bedkom sine retningslinjer
                                                            </Text>
                                                        </Link>
                                                    </NextLink>
                                                    <Text ml="0.5rem" fontWeight="bold">
                                                        .
                                                    </Text>
                                                </Wrap>
                                            ) : (
                                                <Text ml="0.5rem" fontWeight="bold">
                                                    Jeg er klar over at jeg må melde meg av innen 24 timer før
                                                    arrangementet, dersom jeg ikke kan møte opp.
                                                </Text>
                                            )}
                                        </Text>
                                    </FormTerm>
                                </VStack>
                            </ModalBody>
                            <ModalFooter>
                                <Button type="submit" mr={3} colorScheme="teal">
                                    Send inn
                                </Button>
                                <Button onClick={onClose}>Lukk</Button>
                            </ModalFooter>
                        </form>
                    </FormProvider>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default RegistrationForm;
