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
    useBoolean,
    Checkbox,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { getTime, startOfYear, isAfter } from 'date-fns';
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

    const [hideOld, setHideOld] = useBoolean();

    const filteredUsers = users
        ? users
              .filter((user) => !(hideOld && isAfter(startOfYear(new Date()), user.modifiedAt)))
              .sort((a, b) => getTime(b.modifiedAt) - getTime(a.modifiedAt))
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
            <SEO title="Administrer brukere" />
            <Section>
                {(error ?? userError) && (
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
                            <Heading size={['md', 'lg', 'xl']}>Administrer brukere</Heading>
                            <Spacer />
                            <Stack direction={['column', null, null, 'row']}>
                                <Checkbox mx="1rem" onInput={setHideOld.toggle} ml="5">
                                    Skjul gamle
                                </Checkbox>
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
                                        <Th>Medlemskap</Th>
                                        <Th>Sist endret</Th>
                                        <Th>Rediger</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {filteredUsers.map((user) => (
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
