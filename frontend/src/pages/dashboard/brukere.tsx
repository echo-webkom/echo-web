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
    Button,
    Input,
} from '@chakra-ui/react';
import { useState } from 'react';
import Section from '@components/section';
import SEO from '@components/seo';
import UserRow from '@components/user-row';
import ButtonLink from '@components/button-link';
import useUserSearch from '@hooks/use-user-search';

const AdminUserPage = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [page, setPage] = useState<number>(1);

    const { users, error, loading, refetch } = useUserSearch({
        page,
        searchTerm,
    });

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        void refetch({ searchTerm, page: newPage });
    };

    const handleSearch = () => {
        void refetch({
            page,
            searchTerm,
        });
    };

    const handleReset = () => {
        setSearchTerm('');
        setPage(1);
    };

    return (
        <>
            <SEO title="Administrer brukere" />
            <Section>
                {error && (
                    <Center flexDirection="column" gap="5" py="10">
                        <Heading>En feil har skjedd.</Heading>
                        <Text>{error.message}</Text>
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
                    <Stack spacing="1rem">
                        <Stack direction={['column', 'row']} spacing="1rem" justifyContent="space-between">
                            <Heading size={['md', 'lg', 'xl']}>Administrer brukere</Heading>

                            <Stack direction="row" spacing="1">
                                <Input
                                    placeholder="Søk"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Button onClick={handleSearch}>Søk</Button>
                                <Button colorScheme="red" onClick={handleReset}>
                                    Reset
                                </Button>
                            </Stack>
                        </Stack>

                        {users.length === 0 ? (
                            <Center flexDirection="column" gap="5" py="10">
                                <Heading>Ingen brukere funnet.</Heading>
                            </Center>
                        ) : (
                            <>
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
                                            {users.map((user) => (
                                                <UserRow key={user.email} initialUser={user} />
                                            ))}
                                        </Tbody>
                                    </Table>
                                </TableContainer>

                                <Center gap="1rem">
                                    <Button isDisabled={page <= 1} onClick={() => handlePageChange(page - 1)}>
                                        Forrige
                                    </Button>

                                    <Text>Side {page}</Text>

                                    <Button isDisabled={users.length < 10} onClick={() => handlePageChange(page + 1)}>
                                        Neste
                                    </Button>
                                </Center>
                            </>
                        )}
                    </Stack>
                )}
            </Section>
        </>
    );
};

export default AdminUserPage;
