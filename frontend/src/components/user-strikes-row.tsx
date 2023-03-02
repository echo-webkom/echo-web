import {
    Modal,
    Text,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Stack,
    Flex,
    ModalFooter,
    Button,
    Tr,
    Td,
    useDisclosure,
} from '@chakra-ui/react';
import { useState } from 'react';
import type { User } from '@api/user';
import capitalize from '@utils/capitalize';

interface Props {
    initialUser: User;
}

const UserStrikesRow = ({ initialUser }: Props) => {
    const [user] = useState<User>(initialUser);

    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <Tr key={user.email}>
            <Td>{user.name}</Td>
            <Td>{user.email}</Td>
            <Td>{user.strikes}</Td>
            <Td>
                <Button onClick={onOpen}>Se mer</Button>

                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Bruker info</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack>
                                <Flex gap="3">
                                    <Text fontWeight="bold">Navn:</Text>
                                    <Text>{user.name}</Text>
                                </Flex>

                                <Flex gap="3">
                                    <Text fontWeight="bold">E-post:</Text>
                                    <Text>{user.email}</Text>
                                </Flex>
                                {user.alternateEmail && (
                                    <Flex gap="3">
                                        <Text fontWeight="bold">Alternativ e-post:</Text>
                                        <Text>{user.alternateEmail}</Text>
                                    </Flex>
                                )}
                                <Flex gap="3">
                                    <Text fontWeight="bold">Antall prikker:</Text>
                                    <Text>{user.strikes}</Text>
                                </Flex>

                                <Flex gap="3">
                                    <Text fontWeight="bold">Studieretning:</Text>
                                    <Text>{user.degree}</Text>
                                </Flex>

                                <Flex gap="3">
                                    <Text fontWeight="bold">Årstrinn:</Text>
                                    <Text>{user.degreeYear}</Text>
                                </Flex>

                                <Flex gap="3">
                                    <Text fontWeight="bold">Medlemskap:</Text>
                                    <Text>
                                        {user.memberships.length > 0 &&
                                            user.memberships.map((m: string) => capitalize(m)).join(', ')}
                                    </Text>
                                </Flex>
                            </Stack>
                        </ModalBody>

                        <ModalFooter>
                            <Button onClick={onClose} variant="ghost">
                                Lukk
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Td>
        </Tr>
    );
};

export default UserStrikesRow;
