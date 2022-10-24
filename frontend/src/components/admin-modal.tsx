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
    Checkbox,
    ModalFooter,
    Button,
    useToast,
} from '@chakra-ui/react';
import type { StudentGroup } from '@api/dashboard';
import { studentGroups } from '@api/dashboard';
import type { User } from '@api/user';
import capitalize from '@utils/capitalize';

interface Props {
    user: User;
    isOpen: boolean;
    onClose: () => void;
}

const AdminModal = ({ user, isOpen, onClose }: Props) => {
    const toast = useToast();

    const handleChange = (group: StudentGroup) => {
        const newGroups = user.memberships.includes(group)
            ? user.memberships.filter((g) => g !== group)
            : [...user.memberships, group];

        toast({
            title: `Updating ${user.email}`,
            description: `${newGroups.toString()}`,
            status: 'info',
            isClosable: true,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Rediger bruker</ModalHeader>
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

                        <Flex gap="3">
                            <Text fontWeight="bold">Alternativ e-post:</Text>
                            <Text>{user.alternateEmail}</Text>
                        </Flex>

                        <Flex gap="3">
                            <Text fontWeight="bold">Studieretning:</Text>
                            <Text>{user.degree}</Text>
                        </Flex>

                        <Flex gap="3">
                            <Text fontWeight="bold">Årstrinn:</Text>
                            <Text>{user.degreeYear}</Text>
                        </Flex>

                        <Text fontWeight="bold">Medlemskap:</Text>
                        <Stack>
                            {studentGroups.map((group) => {
                                const isMember = user.memberships.includes(group);

                                return (
                                    <Flex gap="2" key={group}>
                                        <Checkbox defaultChecked={isMember} onChange={() => handleChange(group)}>
                                            <Text>{capitalize(group)}</Text>
                                        </Checkbox>
                                    </Flex>
                                );
                            })}
                        </Stack>
                    </Stack>
                </ModalBody>

                <ModalFooter>
                    <Button onClick={onClose} variant="ghost">
                        Lukk
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AdminModal;
