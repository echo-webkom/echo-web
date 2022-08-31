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
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import type { Registration } from '@api/registration';
import { RegistrationAPI } from '@api/registration';
import notEmptyOrNull from '@utils/not-empty-or-null';

interface Props {
    registration: Registration;
    questions: Array<string> | null;
    link: string;
    backendUrl: string;
}

const MotionTr = motion<TableRowProps>(Tr);

const RegistrationRow = ({ registration, questions, link, backendUrl }: Props) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [deleted, setDeleted] = useState(false);

    const toast = useToast();

    const router = useRouter();

    return (
        <>
            <MotionTr
                layout
                height={deleted ? '0%' : '100%'}
                data-cy={`reg-row-${registration.email}`}
                key={JSON.stringify(registration)}
            >
                <Td>{registration.email}</Td>
                <Td>{registration.firstName}</Td>
                <Td>{registration.lastName}</Td>
                <Td>{registration.degreeYear}</Td>
                {notEmptyOrNull(registration.answers) &&
                    registration.answers.map((ans, index) => (
                        <Td key={`answer-${index}-${JSON.stringify(ans)}`}>{ans.answer}</Td>
                    ))}
                {!notEmptyOrNull(registration.answers) && notEmptyOrNull(questions) && (
                    <Td fontStyle="italic">ikke besvart</Td>
                )}
                {registration.waitList ? (
                    <Td data-cy="reg-row-waitlist-true" fontWeight="bold" color="red.400">
                        Ja
                    </Td>
                ) : (
                    <Td data-cy="reg-row-waitlist-false" fontWeight="bold" color="green.400">
                        Nei
                    </Td>
                )}
                <Td>
                    <Button data-cy="delete-button" onClick={onOpen} bg="red.400">
                        Slett påmelding
                    </Button>
                </Td>
            </MotionTr>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        <Heading size="lg">Bekreft sletting</Heading>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Heading
                            size="md"
                            pb="0.5rem"
                            lineHeight="1.5"
                        >{`Er du sikker på at du vil slette påmeldingen med email '${registration.email}'?`}</Heading>
                        <Text fontWeight="bold" py="0.5rem" lineHeight="1.5">
                            Den vil bli borte for alltid.
                        </Text>
                        <Text py="0.5rem" lineHeight="1.5">
                            Dersom det er noen på venteliste, vil denne handlingen automatisk rykke første person på
                            venteliste opp, uten at de får beskjed om dette.
                        </Text>
                    </ModalBody>

                    <ModalFooter>
                        <SimpleGrid columns={2} spacingX="2rem">
                            {/* eslint-disable @typescript-eslint/no-misused-promises */}
                            <Button
                                data-cy="confirm-delete-button"
                                bg="green.400"
                                onClick={async () => {
                                    const { error } = await RegistrationAPI.deleteRegistration(
                                        link,
                                        registration.email,
                                        backendUrl,
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
                            {/* eslint-enable @typescript-eslint/no-misused-promises */}
                            <Button onClick={onClose}>Nei</Button>
                        </SimpleGrid>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default RegistrationRow;
