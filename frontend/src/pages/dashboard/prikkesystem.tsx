import {
    Stack,
    Heading,
    TableContainer,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Text,
    Center,
    Spinner,
    Flex,
    Spacer,
    Button,
    useDisclosure,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useBoolean,
    Checkbox,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Section from '@components/section';
import SEO from '@components/seo';
import type { ErrorMessage } from '@utils/error';
import { isErrorMessage } from '@utils/error';
import type { User } from '@api/user';
import { UserAPI } from '@api/user';
import useAuth from '@hooks/use-auth';
import ButtonLink from '@components/button-link';
import UserStrikesRow from '@components/user-strikes-row';

const AdminStrikesPage = () => {
    const [users, setUsers] = useState<Array<User>>();
    const [error, setError] = useState<ErrorMessage | null>();
    const [loading, setLoading] = useState<boolean>(true);

    const { signedIn, idToken, error: userError } = useAuth();

    const { isOpen, onOpen, onClose } = useDisclosure();

    const [showAll, setShowAll] = useBoolean();

    const filteredUsers = users
        ? users.filter((user) => showAll || user.strikes > 0).sort((a, b) => b.strikes - a.strikes)
        : [];

    useEffect(() => {
        const fetchUsers = async () => {
            setError(null);

            if (!signedIn || !idToken) {
                setLoading(false);
                setError({ message: 'Du må være logget inn for å se denne siden.' });
                return;
            }

            const result = await UserAPI.getUsers(idToken);

            if (isErrorMessage(result)) {
                setError(result);
            } else {
                setUsers(result);
            }

            setLoading(false);
        };

        void fetchUsers();
    }, [idToken, signedIn]);

    return (
        <>
            <SEO title="Prikkesystem" />
            <Section>
                {(error || userError) && (
                    <Center flexDirection="column" gap="5" py="10">
                        <Heading>En feil har skjedd.</Heading>
                        <Text>{error?.message ?? userError?.message}</Text>
                        <ButtonLink href="/dashboard">Tilbake</ButtonLink>
                    </Center>
                )}
                {loading && (
                    <Center flexDirection="column" gap="5" py="10">
                        <Heading>Laster inn...</Heading>
                        <Spinner size="xl" mx="auto" />
                    </Center>
                )}
                {users && (
                    <>
                        <Flex mb="1.5rem">
                            <Heading size={['md', 'lg', 'xl']}>Prikkesystem</Heading>
                            <Spacer />
                            <Stack direction={['column', null, null, 'row']}>
                                <Checkbox mx="1rem" onInput={setShowAll.toggle} ml="5">
                                    Vis alle
                                </Checkbox>
                                <Button onClick={onOpen} fontSize="sm">
                                    Regler for prikkesystem
                                </Button>
                                <ButtonLink size={['sm', null, 'md']} href="/dashboard">
                                    Tilbake
                                </ButtonLink>
                            </Stack>
                        </Flex>

                        <TableContainer>
                            <Table variant="simple" size="sm">
                                <Thead>
                                    <Tr>
                                        <Th>Navn</Th>
                                        <Th>Email</Th>
                                        <Th>Antall prikker</Th>
                                        <Th>Rediger</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {filteredUsers.map((user) => (
                                        <UserStrikesRow key={user.email} initialUser={user} />
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </>
                )}
            </Section>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent mx="5">
                    <ModalHeader>Hvordan fungerer det?</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody as={Stack} gap="2">
                        <Text>Før frist: en prikk </Text>
                        <Text>Etter frist: to prikker</Text>
                        <Text>Ikke møtt: en prikk, utestengt på tre bedpresser</Text>
                        <Text>Utestengt: utestengt på tre bedpresser</Text>
                        <Text>Oppgitt feil informasjon med vilje: en prikk</Text>
                        <Text>For sent: en prikk</Text>
                        <Text fontWeight="bold">For å endre prikker må du slette en påmelding på en bedpress.</Text>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onClose}>Ok, jeg forstår</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default AdminStrikesPage;
