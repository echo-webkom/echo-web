import {
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
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Section from '@components/section';
import SEO from '@components/seo';
import UserRow from '@components/user-row';
import type { ErrorMessage } from '@utils/error';
import { isErrorMessage } from '@utils/error';
import type { User } from '@api/user';
import { UserAPI } from '@api/user';
import useAuth from '@hooks/use-auth';
import ButtonLink from '@components/button-link';

const AdminUserPage = () => {
    const [users, setUsers] = useState<Array<User>>();
    const [error, setError] = useState<ErrorMessage | null>();
    const [loading, setLoading] = useState<boolean>(true);

    const { signedIn, idToken, error: userError } = useAuth();

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
            <SEO title="Administrer brukere" />
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
                        <Flex>
                            <Heading>Administrer brukere</Heading>
                            <Spacer />
                            <ButtonLink href="/dashboard">Tilbake</ButtonLink>
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
