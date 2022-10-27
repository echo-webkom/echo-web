import {
    Heading,
    TableContainer,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Text,
    Button,
    Center,
    Link,
    Spinner,
    Flex,
    Spacer,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import Section from '@components/section';
import SEO from '@components/seo';
import UserRow from '@components/user-row';
import type { ErrorMessage } from '@utils/error';
import { isErrorMessage } from '@utils/error';
import type { User } from '@api/user';
import { UserAPI } from '@api/user';

const AdminUserPage = () => {
    const [users, setUsers] = useState<Array<User>>();
    const [error, setError] = useState<ErrorMessage | null>();
    const [loading, setLoading] = useState<boolean>(true);

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
                        <Flex>
                            <Heading>Administrer brukere</Heading>
                            <Spacer />
                            <NextLink href="/dashboard" passHref>
                                <Button as="a" colorScheme="blue" my="1rem">
                                    Tilbake
                                </Button>
                            </NextLink>
                        </Flex>

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
