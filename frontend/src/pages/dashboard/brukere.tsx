import {
    Heading,
    TableContainer,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
<<<<<<< HEAD
    Text,
    Button,
=======
    Td,
    Text,
    Button,
    useDisclosure,
>>>>>>> 03f2cb84 (🚧 Manage user groups)
    Center,
    Link,
    Spinner,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import Section from '@components/section';
import SEO from '@components/seo';
<<<<<<< HEAD
import UserRow from '@components/user-row';
=======
>>>>>>> 03f2cb84 (🚧 Manage user groups)
import type { ErrorMessage } from '@utils/error';
import { isErrorMessage } from '@utils/error';
import type { User } from '@api/user';
import { UserAPI } from '@api/user';
<<<<<<< HEAD
=======
import capitalize from '@utils/capitalize';
import AdminModal from '@components/admin-modal';
>>>>>>> 03f2cb84 (🚧 Manage user groups)

const AdminUserPage = () => {
    const [users, setUsers] = useState<Array<User>>();
    const [error, setError] = useState<ErrorMessage | null>();
    const [loading, setLoading] = useState<boolean>(true);

<<<<<<< HEAD
=======
    const { isOpen, onOpen, onClose } = useDisclosure();

>>>>>>> 03f2cb84 (🚧 Manage user groups)
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
                                        <UserRow key={user.email} initialUser={user} />
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
