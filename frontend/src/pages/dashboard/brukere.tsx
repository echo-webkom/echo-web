import {
    Heading,
    TableContainer,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Td,
    Text,
    Button,
    useDisclosure,
    Center,
    Link,
    Spinner,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import Section from '@components/section';
import SEO from '@components/seo';
import type { ErrorMessage } from '@utils/error';
import { isErrorMessage } from '@utils/error';
import type { User } from '@api/user';
import { UserAPI } from '@api/user';
import capitalize from '@utils/capitalize';
import AdminModal from '@components/admin-modal';

const AdminUserPage = () => {
    const [users, setUsers] = useState<Array<User>>();
    const [error, setError] = useState<ErrorMessage | null>();
    const [loading, setLoading] = useState<boolean>(true);

    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        const fetchUsers = async () => {
            const result = await UserAPI.getUsers();

            if (!isErrorMessage(result)) {
                setUsers(result);
            } else {
                setError(result);
            }

            setLoading(false);
        };

        void fetchUsers();
    }, []);

    return (
        <>
            <SEO title="Administrer brukere" />
            <Section>
                {error && (
                    <Center flexDirection="column" gap="5" py="10">
                        <Heading>En feil har skjedd.</Heading>
                        <Text>{error.message}</Text>
                        <Button>
                            <NextLink href="/" passHref>
                                <Link>Tilbake til forsiden</Link>
                            </NextLink>
                        </Button>
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
                        <Heading>Administrer brukere</Heading>
                        <TableContainer>
                            <Table variant="simple">
                                <Thead>
                                    <Tr>
                                        <Th>Navn:</Th>
                                        <Th>Email:</Th>
                                        <Th>Medlemskap:</Th>
                                        <Th>Rediger:</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {users.map((user) => (
                                        <Tr key={user.email}>
                                            <Td>{user.name}</Td>
                                            <Td>{user.email}</Td>
                                            <Td>
                                                {user.memberships.length > 0 &&
                                                    user.memberships.map((m: string) => capitalize(m)).join(', ')}
                                            </Td>
                                            <Td>
                                                <Button onClick={onOpen}>Rediger</Button>

                                                <AdminModal isOpen={isOpen} onClose={onClose} user={user} />
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </>
                )}
            </Section>
        </>
    );
};

export default AdminUserPage;
