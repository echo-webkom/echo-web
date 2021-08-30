import React, { useRef } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalFooter,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Button,
    FormControl,
    FormLabel,
    Input,
    Radio,
    Text,
    RadioGroup,
    VStack,
    Select,
    Box,
    Checkbox,
    useToast,
} from '@chakra-ui/react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { Degree, HappeningType, RegistrationAPI } from '../lib/api/registration';
import { Bedpres } from '../lib/api/bedpres';
import { Question } from '../lib/api/decoders';
import { Event } from '../lib/api/event';

const QuestionComponent = ({ q, index }: { q: Question; index: number }): JSX.Element => {
    const { register } = useFormContext();

    if (q.inputType === 'radio') {
        return (
            <FormControl as="fieldset" isRequired>
                <FormLabel>{q.questionText}</FormLabel>
                <RadioGroup defaultValue={q?.alternatives?.[0] || ''}>
                    <VStack align="left">
                        {q.alternatives &&
                            q.alternatives.map((alt: string) => {
                                return (
                                    <Radio key={`radio-key-${alt}`} value={alt} {...register(`answers.${index}`)}>
                                        {alt}
                                    </Radio>
                                );
                            })}
                    </VStack>
                </RadioGroup>
            </FormControl>
        );
    }
    if (q.inputType === 'textbox') {
        return (
            <FormControl isRequired>
                <FormLabel>{q.questionText}</FormLabel>
                <Input {...register(`answers.${index}`)} />
            </FormControl>
        );
    }

    return <></>;
};

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

const HappeningForm = ({
    happening,
    type,
    backendUrl,
}: {
    happening: Bedpres | Event;
    type: HappeningType;
    backendUrl: string;
}): JSX.Element => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const methods = useForm();
    const { register, handleSubmit } = methods;

    const toast = useToast();

    const initialRef = useRef<HTMLInputElement | null>(null);
    const { ref, ...rest } = register('email'); // needed for inital focus ref

    const submitForm = async (data: {
        email: string;
        firstName: string;
        lastName: string;
        degree: Degree;
        degreeYear: number;
        terms1: boolean;
        terms2: boolean;
        terms3: boolean;
        answers: Array<string>;
    }) => {
        RegistrationAPI.submitRegistration(
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
            },
            backendUrl,
        ).then(({ response, statusCode }) => {
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
                        <form data-cy="reg-form" onSubmit={handleSubmit(submitForm)}>
                            <ModalHeader>Påmelding</ModalHeader>
                            <ModalCloseButton />
                            <ModalBody pb="8px">
                                <VStack spacing={4}>
                                    <FormControl id="email" isRequired>
                                        <FormLabel>E-post</FormLabel>
                                        <Input
                                            type="email"
                                            placeholder="E-post"
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
                                        <Input placeholder="Fornavn" {...register('firstName')} />
                                    </FormControl>
                                    <FormControl id="lastName" isRequired>
                                        <FormLabel>Etternavn</FormLabel>
                                        <Input placeholder="Etternavn" {...register('lastName')} />
                                    </FormControl>
                                    <FormControl id="degree" isRequired>
                                        <FormLabel>Studieretning</FormLabel>
                                        <Select placeholder="Velg studieretning" {...register('degree')}>
                                            <option value={Degree.DTEK}>Datateknologi</option>
                                            <option value={Degree.DSIK}>Datasikkerhet</option>
                                            <option value={Degree.DVIT}>Data Science/Datavitenskap</option>
                                            <option value={Degree.BINF}>Bioinformatikk</option>
                                            <option value={Degree.IMO}>Informatikk-matematikk-økonomi</option>
                                            <option value={Degree.IKT}>Informasjons- og kommunikasjonsvitenskap</option>
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
                                            <VStack align="left">
                                                <Radio value="1" {...register('degreeYear')}>
                                                    1. trinn
                                                </Radio>
                                                <Radio value="2" {...register('degreeYear')}>
                                                    2. trinn
                                                </Radio>
                                                <Radio value="3" {...register('degreeYear')}>
                                                    3. trinn
                                                </Radio>
                                                <Radio value="4" {...register('degreeYear')}>
                                                    4. trinn
                                                </Radio>
                                                <Radio value="5" {...register('degreeYear')}>
                                                    5. trinn
                                                </Radio>
                                            </VStack>
                                        </RadioGroup>
                                    </FormControl>
                                    {happening.additionalQuestions &&
                                        happening.additionalQuestions.map((q: Question, index: number) => {
                                            return (
                                                <QuestionComponent
                                                    key={`q.questionText-${q.inputType}`}
                                                    q={q}
                                                    index={index}
                                                />
                                            );
                                        })}
                                    <FormControl id="terms1" isRequired>
                                        <FormLabel>Bekreft</FormLabel>
                                        <Checkbox {...register('terms1')}>
                                            <Text ml="0.5rem" fontWeight="bold">
                                                Jeg bekrefter at jeg har fylt inn riktig informasjon.
                                            </Text>
                                        </Checkbox>
                                    </FormControl>
                                    <FormControl id="terms2" isRequired>
                                        <FormLabel>Bekreft</FormLabel>
                                        <Checkbox {...register('terms2')}>
                                            <Text ml="0.5rem" fontWeight="bold">
                                                {`Jeg er klar over at hvis jeg ikke møter opp risikerer jeg å bli
                                                utestengt fra fremtidige 
                                                ${
                                                    type === HappeningType.BEDPRES
                                                        ? 'bedriftspresentasjoner'
                                                        : 'arrangementer'
                                                }.`}
                                            </Text>
                                        </Checkbox>
                                    </FormControl>
                                    <FormControl id="terms3" isRequired>
                                        <FormLabel>Bekreft</FormLabel>
                                        <Checkbox {...register('terms3')}>
                                            <Text ml="0.5rem" fontWeight="bold">
                                                {`Jeg er klar over at jeg må melde meg av innen 48 timer før
                                                ${
                                                    type === HappeningType.BEDPRES
                                                        ? 'bedriftspresentasjonen'
                                                        : 'arrangementet'
                                                } starter dersom jeg ikke har mulighet til å delta.`}
                                            </Text>
                                        </Checkbox>
                                    </FormControl>
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

export default HappeningForm;
