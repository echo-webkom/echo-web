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
} from '@chakra-ui/react';
import { useContext } from 'react';
import { useSession } from 'next-auth/react';
import type { SubmitHandler } from 'react-hook-form';
import { FormProvider, useForm } from 'react-hook-form';
import { MdOutlineArrowForward } from 'react-icons/md';
import NextLink from 'next/link';
import { differenceInHours, format, isBefore, isPast, parseISO } from 'date-fns';
import { enUS, nb } from 'date-fns/locale';
import Countdown from '@components/countdown';
import type { Happening, HappeningType, Question } from '@api/happening';
import type { RegFormValues } from '@api/registration';
import { userIsComplete } from '@api/user';
import type { User } from '@api/user';
import { RegistrationAPI } from '@api/registration';
import FormQuestion from '@components/form-question';
import LanguageContext from 'language-context';
import useCountdown from '@hooks/use-countdown';
import hasOverlap from '@utils/has-overlap';
import capitalize from '@utils/capitalize';

const codeToStatus = (statusCode: number): 'success' | 'warning' | 'error' => {
    if (statusCode === 200) return 'success';
    if (statusCode === 202 || statusCode === 400 || statusCode === 422) return 'warning';
    return 'error';
};

interface Props {
    happening: Happening;
    type: HappeningType;
    user: User | null;
    loadingUser: boolean;
}

const chooseDate = (regDate: string | null, studentGroupRegDate: string | null, viaStudentGroupReg: boolean): Date => {
    if (!regDate && !studentGroupRegDate) return new Date();
    if (!regDate && studentGroupRegDate) return viaStudentGroupReg ? parseISO(studentGroupRegDate) : new Date();
    if (regDate && !studentGroupRegDate) return parseISO(regDate);
    if (regDate && studentGroupRegDate) return parseISO(viaStudentGroupReg ? studentGroupRegDate : regDate);
    // Shouldn't be possible to reach this point, but TypeScript doesn't know that
    return new Date();
};

const RegistrationForm = ({ happening, type, user, loadingUser }: Props): JSX.Element => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const isNorwegian = useContext(LanguageContext);
    const methods = useForm<RegFormValues>();
    const { register, handleSubmit } = methods;

    const viaStudentGroupReg = hasOverlap(happening.studentGroups, user?.memberships);
    const regDate = chooseDate(happening.registrationDate, happening.studentGroupRegistrationDate, viaStudentGroupReg);
    const { hours, minutes, seconds } = useCountdown(regDate);

    const toast = useToast();

    const { data: session, status } = useSession();

    const submitForm: SubmitHandler<RegFormValues> = async (data) => {
        if (!session?.idToken) {
            toast({
                title: 'Du er ikke logget inn.',
                description: 'Logg inn for å melde deg på.',
                status: 'warning',
            });
            return;
        }

        const { response, statusCode } = await RegistrationAPI.submitRegistration(
            {
                email: data.email,
                slug: happening.slug,
                answers: happening.additionalQuestions.map((q: Question, index: number) => {
                    return { question: q.questionText, answer: data.answers[index] };
                }),
                type: type,
            },
            session.idToken,
        );

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
    };

    if (status === 'loading' || loadingUser)
        return (
            <Box data-testid="registration-form">
                <Center>
                    <Spinner />
                </Center>
            </Box>
        );

    if (status === 'unauthenticated')
        return (
            <Box data-testid="registration-form">
                <Text textAlign="center">Logg inn for å melde deg på</Text>
            </Box>
        );

    if (
        !viaStudentGroupReg &&
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
            {user && !userIsComplete(user) && (
                <>
                    <Alert status="warning" borderRadius="0.5rem" mb="5">
                        <AlertIcon />
                        Du må fylle ut all nødvendig informasjon for å kunne melde deg på arrangementer!
                    </Alert>
                    <NextLink href="/profile" passHref>
                        <Button w="100%" rightIcon={<MdOutlineArrowForward />} colorScheme="teal" variant="outline">
                            Min profil
                        </Button>
                    </NextLink>
                </>
            )}
            {isBefore(new Date(), regDate) &&
                (differenceInHours(regDate, new Date()) > 23 ? (
                    <Center>
                        <Text fontSize="xl">
                            {isNorwegian ? `Påmelding åpner ` : `Registration opens `}
                            {format(regDate, 'dd. MMM HH:mm', {
                                locale: isNorwegian ? nb : enUS,
                            })}
                        </Text>
                    </Center>
                ) : (
                    <Countdown hours={hours} minutes={minutes} seconds={seconds} />
                ))}
            {userIsComplete(user) && isPast(regDate) && (
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
                    {isNorwegian
                        ? viaStudentGroupReg
                            ? 'Klikk for å melde deg på via studentgruppen din'
                            : 'Klikk for å melde deg på'
                        : 'Click to register'}
                </Button>
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
