import type { TableRowProps } from '@chakra-ui/react';
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
import { isErrorMessage } from '@utils/error';

interface Props {
    registration: Registration;
    questions: Array<string> | null;
    canPromote: boolean;
}

const MotionTr = motion<TableRowProps>(Tr);

const RegistrationRow = ({ registration, questions, canPromote }: Props) => {
    const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure();

    const [deleted, setDeleted] = useState(false);

    const [strikes, setStrikes] = useState(0);

    const toast = useToast();

    const router = useRouter();

    const { user, idToken, signedIn } = useAuth();

    const strikesPermission = user?.memberships.includes('bedkom');

    const handleDelete = async () => {
        if (!signedIn || !idToken) {
            toast({
                title: 'Du er ikke logget inn.',
                status: 'error',
                isClosable: true,
            });
            return;
        }

        const resp = await RegistrationAPI.deleteRegistration(
            idToken,
            `Slettet av ${user?.email ?? 'arrangør'} med ${strikes} prikker`,
            registration.slug,
            registration.email,
            strikes,
        );

        onCloseDelete();

        if (isErrorMessage(resp)) {
            toast({
                title: 'Det har skjedd en feil!',
                description: resp.message,
                status: 'error',
                isClosable: true,
            });
        } else {
            setDeleted(true);
            void router.replace(router.asPath, undefined, { scroll: false });
            toast({
                title: 'Påmelding slettet!',
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                description: `Slettet påmeding med email '${registration.alternateEmail || registration.email}'.`,
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
                {
                    {
                        WAITLIST: (
                            <Td fontSize="md" fontWeight="bold" color="yellow.400">
                                {canPromote ? <PromoteButton registration={registration} /> : 'Venteliste'}
                            </Td>
                        ),
                        REGISTERED: (
                            <Td fontSize="md" fontWeight="bold" color="green.400">
                                Påmeldt
                            </Td>
                        ),
                        DEREGISTERED: (
                            <Td fontSize="md" fontWeight="bold" color="red.400">
                                Avmeldt
                            </Td>
                        ),
                    }[registration.registrationStatus]
                }
                <Td fontSize="md">{registration.reason}</Td>

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
                        {strikesPermission && (
                            <>
                                <Text fontWeight="bold"> Sett antall prikker</Text>
                                <Text py="0.5rem" lineHeight="1.5">
                                    Tallet som står er antall prikker en bruker har fra før av.
                                </Text>
                                <NumberInput
                                    defaultValue={user?.strikes}
                                    name="numstrikes"
                                    size="md"
                                    maxW={100}
                                    min={0}
                                    max={5}
                                    onChange={(value) => setStrikes(Number.parseInt(value))}
                                >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <SimpleGrid columns={2} spacingX="2rem">
                            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                            <Button data-cy="confirm-delete-button" bg="green.400" onClick={handleDelete}>
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
