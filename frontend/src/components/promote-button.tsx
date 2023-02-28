import React from 'react';
import {
    Button,
    Heading,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    SimpleGrid,
    useDisclosure,
    Text,
    useToast,
} from '@chakra-ui/react';
import useAuth from '@hooks/use-auth';
import type { Registration } from '@api/registration';
import WaitinglistAPI from '@api/waitinglist';

interface Props {
    registration: Registration;
}

const PromoteButton = ({ registration }: Props) => {
    const { idToken, signedIn } = useAuth();

    const { isOpen: isOpenPromote, onOpen: onOpenPromote, onClose: onClosePromote } = useDisclosure();

    const toast = useToast();

    const handlePromote = async () => {
        if (!signedIn || !idToken) {
            toast({
                title: 'Du er ikke logget inn.',
                status: 'error',
                isClosable: true,
            });
            return;
        }
        const { statusCode } = await WaitinglistAPI.promoteDirectly(registration, idToken);

        if (statusCode === 200) {
            onClosePromote();
            toast({
                title: 'Bruker ble tildelt plass!',
                status: 'success',
                isClosable: true,
            });
        } else {
            toast({
                title: 'Kunne ikke tildele plass.',
                status: 'error',
                isClosable: true,
            });
        }
    };

    const handleEmail = async () => {
        if (!signedIn || !idToken) {
            toast({
                title: 'Du er ikke logget inn.',
                status: 'error',
                isClosable: true,
            });
            return;
        }
        const { statusCode } = await WaitinglistAPI.promoteSendEmail(registration, idToken);

        if (statusCode === 200) {
            onClosePromote();
            toast({
                title: 'E-post er sendt.',
                status: 'success',
                isClosable: true,
            });
        } else {
            toast({
                title: 'Kunne ikke sende e-post.',
                status: 'error',
                isClosable: true,
            });
        }
    };

    return (
        <>
            <Button onClick={onOpenPromote} colorScheme="pink">
                Gi ledig plass
            </Button>

            <Modal isOpen={isOpenPromote} onClose={onClosePromote}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        <Heading fontSize="md">
                            <Text>Vil du gi en ledig plass til '{registration.name}'?</Text>
                        </Heading>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <p>
                            <Text>
                                E-post med tilbud om plass blir sendt til: '
                                {registration.alternateEmail ?? registration.email}'.
                            </Text>
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <SimpleGrid columns={2} spacingX="2rem">
                            <Button colorScheme="green" onClick={() => void handleEmail()}>
                                Send e-post
                            </Button>
                            <Button onClick={() => void handlePromote()}>Gi ledig plass uten å spørre</Button>
                        </SimpleGrid>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default PromoteButton;
