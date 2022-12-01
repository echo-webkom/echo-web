import {
    Box,
    Flex,
    Text,
    Heading,
    SimpleGrid,
    useColorModeValue,
    Button,
    Center,
    Link,
    Spinner,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import Section from '@components/section';
import SEO from '@components/seo';
import ErrorBox from '@components/error-box';
import useAuth from '@hooks/use-auth';

const adminRoutes = [
    {
        title: 'Brukere',
        desc: 'Administrer brukere på siden',
        to: '/dashboard/brukere',
    },
    {
        title: 'Tilbakemeldinger',
        desc: 'Se og svar på tilbakemeldinger fra brukere',
        to: '/dashboard/tilbakemeldinger',
    },
];

const DashboardPage = () => {
    const { user, loading, signedIn, error } = useAuth();
    const [isWebkom, setIsWebkom] = useState<boolean>(false);

    const bg = useColorModeValue('gray.200', 'gray.800');

    useEffect(() => {
        if (user) {
            setIsWebkom(user.memberships.includes('webkom'));
        }
    }, [user]);

    return (
        <>
            <SEO title="Dashboard" />
            <Section>
                {!signedIn ||
                    (!isWebkom && (
                        <Center flexDirection="column" gap="5" py="10">
                            <Heading>En feil har skjedd.</Heading>
                            <Text>Du har ikke tilgang til denne siden.</Text>
                            <Button>
                                <NextLink href="/" passHref>
                                    <Link>Tilbake til forsiden</Link>
                                </NextLink>
                            </Button>
                        </Center>
                    ))}
                {error && <ErrorBox error={error.message} />}
                {loading && (
                    <Center flexDirection="column" gap="5" py="10">
                        <Heading>Laster inn...</Heading>
                        <Spinner size="xl" mx="auto" />
                    </Center>
                )}
                {isWebkom && (
                    <>
                        <Heading>Dashboard</Heading>
                        <SimpleGrid columns={[1, null, null, 2]} gap="5">
                            {adminRoutes.map((route) => (
                                <NextLink href={route.to} key={route.title}>
                                    <Box
                                        bg={bg}
                                        borderRadius="md"
                                        overflow="hidden"
                                        cursor="pointer"
                                        h="225px"
                                        appearance="auto"
                                    >
                                        <Flex
                                            direction="column"
                                            borderRadius="md"
                                            cursor="pointer"
                                            boxSize="full"
                                            backdropFilter="auto"
                                            justify="center"
                                            alignItems="center"
                                        >
                                            <Text fontWeight="bold" fontSize="2xl">
                                                {route.title}
                                            </Text>
                                            <Text>{route.desc}</Text>
                                        </Flex>
                                    </Box>
                                </NextLink>
                            ))}
                        </SimpleGrid>
                    </>
                )}
            </Section>
        </>
    );
};

export default DashboardPage;
