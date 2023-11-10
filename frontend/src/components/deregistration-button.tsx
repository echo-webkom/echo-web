import {
    Button,
    Checkbox,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useDisclosure,
    VStack,
    useToast,
} from '@chakra-ui/react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useRef } from 'react';
import { type Happening } from '@api/happening';
import type { DeregisterFormValues } from '@api/registration';
import { RegistrationAPI } from '@api/registration';
import useLanguage from '@hooks/use-language';
import useAuth from '@hooks/use-auth';
import { isErrorMessage } from '@utils/error';

interface Props {
    happening: Happening;
    isWaitlist: boolean;
}

const DeregistrationButton = ({ happening, isWaitlist }: Props) => {
    const isNorwegian = useLanguage();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { register, handleSubmit, reset } = useForm<DeregisterFormValues>();
    const { idToken, user } = useAuth();
    const initialRef = useRef<HTMLInputElement | null>(null);

    const submitForm: SubmitHandler<DeregisterFormValues> = async (data) => {
        if (!idToken || !user?.email) {
            toast({
                title: 'Det har oppstått en feil',
                description: 'Du er ikke logget inn',
                status: 'error',
            });
            return;
        }
        if (!data.confirm || !data.reason) {
            toast({
                title: 'Påkrevde felt er ikke fylt ut',
                status: 'error',
            });
            return;
        }

        const newReason = `Selvmeldt grunn: "${data.reason}"`;

        const resp = await RegistrationAPI.deleteRegistration(
            idToken,
            newReason,
            happening.slug,
            user.email,
            user.strikes,
        );

        if (isErrorMessage(resp)) {
            toast({
                title: 'En feil har skjedd',
                description: 'Fikk ikke til å melde deg av, kontakt arrangør',
                status: 'error',
            });
        } else {
            toast({
                title: 'Du er meldt av',
                description: `Du er meldt av arrangementet: ${happening.title}`,
                status: 'success',
            });
        }

        onClose();

        reset();
    };

    const deleteFromWaitlist = async () => {
        if (!idToken || !user?.email) {
            toast({
                title: 'Det har oppstått en feil',
                description: 'Du er ikke logget inn',
                status: 'error',
            });
            return;
        }

        const resp = await RegistrationAPI.deleteRegistration(
            idToken,
            'Meldt av fra venteliste',
            happening.slug,
            user.email,
            user.strikes,
        );

        if (isErrorMessage(resp)) {
            toast({
                title: 'En feil har skjedd',
            });
        } else {
            toast({
                title: 'Du er meldt av',
                description: `Du er meldt av ventelisten til arrangementet: ${happening.title}`,
                status: 'success',
            });
        }
    };

    if (isWaitlist) {
        return (
            <Button data-cy="del-btn" w="100%" colorScheme="yellow" onClick={() => void deleteFromWaitlist()}>
                {isNorwegian ? 'Meld deg av ventelisten' : 'Deregister from waitlist'}
            </Button>
        );
    }

    return (
        <>
            {happening.happeningType === 'BEDPRES' ? (
                <Button data-cy="del-btn" w="100%" colorScheme="red" isDisabled={true}>
                    {isNorwegian ? 'Du er allerede meldt på' : 'Already registered'}
                </Button>
            ) : (
                <Button data-cy="del-btn" w="100%" colorScheme="red" onClick={onOpen}>
                    {isNorwegian ? 'Meld deg av' : 'Deregister'}
                </Button>
            )}

            <Modal
                isOpen={isOpen}
                initialFocusRef={initialRef}
                onClose={() => {
                    onClose();
                    reset();
                }}
            >
                <ModalOverlay />
                <ModalContent mx="2" minW={['275px', '500px', null, '700px']}>
                    <ModalHeader>{isNorwegian ? 'Meld deg av' : 'Deregister'}</ModalHeader>
                    <ModalCloseButton />
                    {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                    <form onSubmit={handleSubmit(submitForm)}>
                        <ModalBody>
                            <VStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel htmlFor="reason">
                                        {isNorwegian ? 'Hvorfor melder du deg av?' : 'Why are you deregistering?'}
                                    </FormLabel>
                                    <Input
                                        id="reason"
                                        placeholder={isNorwegian ? 'Grunn' : 'Reason'}
                                        {...register('reason')}
                                    />
                                </FormControl>

                                <FormControl
                                    flexDirection="row"
                                    display="flex"
                                    alignItems="center"
                                    gap="2"
                                    h="fit-content"
                                    isRequired
                                >
                                    <Checkbox id="confirm" {...register('confirm')} />

                                    <FormLabel m="0" htmlFor="confirm">
                                        {isNorwegian
                                            ? 'Jeg bekrefter at jeg har fylt inn riktig informasjon.'
                                            : 'I confirm that I have filled in the correct information.'}
                                    </FormLabel>
                                </FormControl>
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                            <Button type="submit" mr={3} colorScheme="red">
                                {isNorwegian ? 'Send inn' : 'Submit'}
                            </Button>
                            <Button onClick={onClose}>{isNorwegian ? 'Lukk' : 'Close'}</Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </>
    );
};

export default DeregistrationButton;
