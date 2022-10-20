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
import { useState } from 'react';
import DashboardAPI, { StudentGroup, studentGroups } from '@api/dashboard';
import type { User } from '@api/user';
import { isErrorMessage } from '@utils/error';
import capitalize from '@utils/capitalize';

interface Props {
    user: User;
    isOpen: boolean;
    onClose: () => void;
}

const AdminModal = ({ user, isOpen, onClose }: Props) => {
    const [memberships, setMemberships] = useState<Array<StudentGroup>>(user.memberships as Array<StudentGroup>);

    const toast = useToast();

    const handleChange = () => {
        toast({
            title: 'Oppdaterer medlemsskap',
            description: `${memberships.toString()}`,
            status: 'info',
            isClosable: true,
        });

        // const result = await DashboardAPI.updateMembership(user.email, u);

        // if (!isErrorMessage(result)) {
        //     toast({
        //         title: 'Oppdatert medlemskap',
        //         description: result,
        //         status: 'success',
        //         duration: 2000,
        //         isClosable: true,
        //     });
        // } else {
        //     toast({
        //         title: 'Noe gikk galt',
        //         description: result.message,
        //         status: 'error',
        //         duration: 2000,
        //         isClosable: true,
        //     });
        // }
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
                                        <Checkbox
                                            defaultChecked={isMember}
                                            onChange={(event) => {
                                                setMemberships((prev) => {
                                                    return event.target.checked
                                                        ? [...prev, group]
                                                        : prev.filter((m) => m !== group);
                                                });
                                                void handleChange();
                                            }}
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
    );
};

export default AdminModal;
