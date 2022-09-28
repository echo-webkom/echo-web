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
} from '@chakra-ui/react';
import { useContext } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { FormProvider, useForm } from 'react-hook-form';
import type { Happening, HappeningType, Question } from '@api/happening';
import type { RegFormValues } from '@api/registration';
import { userIsComplete } from '@api/user';
import type { User } from '@api/user';
import { RegistrationAPI } from '@api/registration';
import FormQuestion from '@components/form-question';
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
    type: HappeningType;
    user: User | null;
}

const RegistrationForm = ({ happening, type, user }: Props): JSX.Element => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const isNorwegian = useContext(LanguageContext);
    const methods = useForm<RegFormValues>();
    const { register, handleSubmit } = methods;

    const toast = useToast();

    const submitForm: SubmitHandler<RegFormValues> = async (data) => {
        await RegistrationAPI.submitRegistration({
            email: data.email,
            slug: happening.slug,
            answers: happening.additionalQuestions.map((q: Question, index: number) => {
                return { question: q.questionText, answer: data.answers[index] };
            }),
            type: type,
        }).then(({ response, statusCode }) => {
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
        <Box data-testid="registration-form">
            {userIsComplete(user) && (
                <Button
                    data-cy="reg-btn"
                    w="100%"
                    colorScheme="teal"
                    onClick={() =>
                        happening.additionalQuestions.length === 0
                            ? void submitForm({ email: user.email, answers: [] })
                            : onOpen()
                    }
                >
                    {isNorwegian ? 'Påmelding' : 'Register'}
                </Button>
            )}
            {!userIsComplete(user) && (
                <>
                    <Text fontWeight="bold" textAlign="center" color="red">
                        Du være innlogget og ha fyllt inn info på profilsiden for å kunne melde deg på
                    </Text>
                </>
            )}

            <Modal isOpen={isOpen} onClose={onClose}>
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
        </Box>
    );
};

export default RegistrationForm;
