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
    Tr,
    Td,
    useDisclosure,
} from '@chakra-ui/react';
import { useState } from 'react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import type { StudentGroup } from '@api/dashboard';
import DashboardAPI, { studentGroups } from '@api/dashboard';
import type { User } from '@api/user';
import capitalize from '@utils/capitalize';
import { isErrorMessage } from '@utils/error';
import useAuth from '@hooks/use-auth';

interface Props {
    initialUser: User;
}

const UserRow = ({ initialUser }: Props) => {
    const [user, setUser] = useState<User>(initialUser);

    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const { signedIn, idToken } = useAuth();

    const handleChange = async (group: StudentGroup) => {
        if (!signedIn || !idToken) {
            toast({
                title: 'Du er ikke logget inn.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        const result = await DashboardAPI.updateMembership(user.email, group, idToken);

        if (isErrorMessage(result)) {
            toast({
                title: 'En feil har skjedd.',
                description: result.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        setUser({ ...user, memberships: result });

        toast({
            title: 'Bruker oppdatert!',
            status: 'success',
            isClosable: true,
        });
    };

    return (
        <Tr key={user.email}>
            <Td>{user.name}</Td>
            <Td>{user.email}</Td>
            <Td>{user.memberships.length > 0 && user.memberships.map((m: string) => capitalize(m)).join(', ')}</Td>
            <Td>{format(user.modifiedAt, 'dd. MMM yyyy', { locale: nb })}</Td>
            <Td>
                <Button onClick={onOpen}>Rediger</Button>

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
                                                <Checkbox
                                                    defaultChecked={isMember}
                                                    onChange={() => void handleChange(group)}
                                                >
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
            </Td>
        </Tr>
    );
};

export default UserRow;
