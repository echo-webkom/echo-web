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
    NumberInput,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInputField,
    NumberInputStepper,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import type { User } from '@api/user';
import { UserAPI } from '@api/user';
import capitalize from '@utils/capitalize';
import useAuth from '@hooks/use-auth';
import { isErrorMessage } from '@utils/error';
import { StrikesAPI } from '@api/strikes';

interface Props {
    initialUser: User;
}

const UserStrikesRow = ({ initialUser }: Props) => {
    const [user] = useState<User>(initialUser);

    const { idToken } = useAuth();

    const { isOpen, onOpen, onClose } = useDisclosure();

    const [strikes, setStrikes] = useState(0);

    useEffect(() => {
        const getAllStrikes = async () => {
            if (!idToken) {
                console.log('no idToken');
                return;
            }
            const res = await StrikesAPI.getAllStrikes(idToken);

            if (isErrorMessage(res))
                return {
                    error: 'Error @ getAllStrikes',
                };
            console.log(res);
        };
        void getAllStrikes();
    }, []);

    // useEffect(() => {
    //     const updateStrikes = async () => {
    //         if (!idToken) return;

    //         const updatedStrikes = await UserAPI.setStrikes(idToken, initialUser.email, strikes);

    //         if (isErrorMessage(updatedStrikes)) return;

    //         setStrikes(updatedStrikes);
    //     };
    //     void updateStrikes();
    // }, [idToken, initialUser.email, strikes]);
    return (
        <Tr key={user.email}>
            <Td>{user.name}</Td>
            <Td>{user.email}</Td>
            <Td>{strikes}</Td>
            <Td>
                <Button onClick={onOpen}>Rediger</Button>

                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Brukerinfo</ModalHeader>
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

                                <Flex gap="3">
                                    <Text fontWeight="bold">Antall nåværende prikker:</Text>
                                    <Text>{strikes}</Text>
                                </Flex>
                                <Flex gap="3">
                                    <Text fontWeight="bold">Endre prikker:</Text>
                                    <NumberInput
                                        defaultValue={strikes}
                                        name="numstrikes"
                                        size="md"
                                        maxW={100}
                                        min={0}
                                        max={5}
                                        onChange={(value) => {
                                            setStrikes(Number.parseInt(value));
                                        }}
                                    >
                                        <NumberInputField />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                </Flex>
                                <Flex gap="3">
                                    <Button onClick={() => setStrikes(strikes)} colorScheme="teal">
                                        Lagre
                                    </Button>
                                    <Button onClick={() => setStrikes(0)} colorScheme="red">
                                        Fjern prikker
                                    </Button>
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
