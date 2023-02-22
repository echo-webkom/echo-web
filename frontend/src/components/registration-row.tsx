import {
    Heading,
    Text,
    Tr,
    Td,
    Button,
    useDisclosure,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    SimpleGrid,
    TableRowProps,
    NumberInput,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInputField,
    NumberInputStepper,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import PromoteButton from './promote-button';
import type { Registration } from '@api/registration';
import { RegistrationAPI } from '@api/registration';
import notEmptyOrNull from '@utils/not-empty-or-null';
import capitalize from '@utils/capitalize';
import useAuth from '@hooks/use-auth';

interface Props {
    registration: Registration;
    questions: Array<string> | null;
    canPromote: boolean;
}

const MotionTr = motion<TableRowProps>(Tr);

const RegistrationRow = ({ registration, questions, canPromote }: Props) => {
    const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure();

    const [deleted, setDeleted] = useState(false);

    const [dotPermission, setDotPermission] = useState(false);

    const [dots, setDots] = useState(0);

    const toast = useToast();

    const router = useRouter();

    const { idToken, signedIn } = useAuth();

    const handleDelete = async () => {
        if (!signedIn || !idToken) {
            toast({
                title: 'Du er ikke logget inn.',
                status: 'error',
                isClosable: true,
            });
            return;
        }

        const { error } = await RegistrationAPI.deleteRegistration(
            registration.slug,
            registration.email,
            idToken,
            dots,
        );

        onCloseDelete();

        if (error === null) {
            setDeleted(true);
            void router.replace(router.asPath, undefined, { scroll: false });
            toast({
                title: 'Påmelding slettet!',
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                description: `Slettet påmeding med email '${registration.alternateEmail || registration.email}'.`,
                isClosable: true,
            });
        } else {
            toast({
                title: 'Det har skjedd en feil!',
                description: error,
                status: 'error',
                isClosable: true,
            });
        }
    };

    return (
        <>
            <MotionTr
                layout
                height={deleted ? '0%' : '100%'}
                data-cy={`reg-row-${registration.email}`}
                key={JSON.stringify(registration)}
            >
                {/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */}
                <Td fontSize="md">{registration.alternateEmail || registration.email}</Td>
                {/* eslint-enable @typescript-eslint/prefer-nullish-coalescing */}
                <Td fontSize="md">{registration.name}</Td>
                <Td fontSize="md">{registration.degree}</Td>
                <Td fontSize="md">{registration.degreeYear}</Td>
                {notEmptyOrNull(registration.answers) &&
                    registration.answers.map((ans, index) => (
                        <Td fontSize="md" key={`answer-${index}-${JSON.stringify(ans)}`}>
                            {ans.answer}
                        </Td>
                    ))}
                {!notEmptyOrNull(registration.answers) && notEmptyOrNull(questions) && (
                    <Td fontSize="md" fontStyle="italic">
                        ikke besvart
                    </Td>
                )}
                {registration.waitList ? (
                    <Td fontSize="md" data-cy="reg-row-waitlist-true" fontWeight="bold" color="red.400">
                        {canPromote ? <PromoteButton registration={registration} /> : 'Ja'}
                    </Td>
                ) : (
                    <Td fontSize="md" data-cy="reg-row-waitlist-false" fontWeight="bold" color="green.400">
                        Nei
                    </Td>
                )}
                <Td fontSize="md">{registration.memberships.map(capitalize).join(', ')}</Td>
                <Td>
                    <Button fontSize="sm" data-cy="delete-button" onClick={onOpenDelete} colorScheme="red">
                        Slett
                    </Button>
                </Td>
            </MotionTr>

            <Modal isOpen={isOpenDelete} onClose={onCloseDelete}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        <Heading size="lg">Bekreft sletting</Heading>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */}
                        {`Er du sikker på at du vil slette påmeldingen med email '${
                            registration.alternateEmail || registration.email
                        }'?`}
                        {/* eslint-enable @typescript-eslint/prefer-nullish-coalescing */}
                        <Text fontWeight="bold" py="0.5rem" lineHeight="1.5">
                            Den vil bli borte for alltid.
                        </Text>
                        <Text py="0.5rem" lineHeight="1.5">
                            Dersom det er noen på venteliste, vil denne handlingen automatisk rykke første person på
                            venteliste opp, uten at de får beskjed om dette.
                        </Text>
                        <Text fontWeight="bold"> Antall prikker </Text>
                        {dotPermission && (
                            <NumberInput
                                name="numDots"
                                size="md"
                                maxW={100}
                                min={0}
                                max={5}
                                onChange={(value) => setDots(value)}
                            >
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <SimpleGrid columns={2} spacingX="2rem">
                            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                            <Button
                                data-cy="confirm-delete-button"
                                bg="green.400"
                                onClick={async () => {
                                    if (!idToken) {
                                        handleDelete();
                                        return;
                                    }
                                    const { error } = await RegistrationAPI.deleteRegistration(
                                        registration.slug,
                                        registration.email,
                                        idToken,
                                        dots,
                                    );

                                    onClose();

                                    if (error === null) {
                                        setDeleted(true);
                                        void router.replace(router.asPath, undefined, { scroll: false });
                                        toast({
                                            title: 'Påmelding slettet!',
                                            description: `Slettet påmeding med email '${registration.email}'.`,
                                            isClosable: true,
                                        });
                                    } else {
                                        toast({
                                            title: 'Det har skjedd en feil!',
                                            description: error,
                                            status: 'error',
                                            isClosable: true,
                                        });
                                    }
                                }}
                            >
                                Ja, slett
                            </Button>
                            <Button onClick={onCloseDelete}>Nei</Button>
                        </SimpleGrid>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default RegistrationRow;
