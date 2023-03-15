import {
    Box,
    Flex,
    Text,
    Heading,
    SimpleGrid,
    useColorModeValue,
    Center,
    Spinner,
    LinkOverlay,
    LinkBox,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import Section from '@components/section';
import SEO from '@components/seo';
import ErrorBox from '@components/error-box';
import useAuth from '@hooks/use-auth';
import ButtonLink from '@components/button-link';
import hasOverlap from '@utils/has-overlap';
import type { StudentGroup } from '@api/dashboard';

const adminRoutes: Array<{ title: string; desc: string; to: string; access: Array<StudentGroup> }> = [
    {
        title: 'Brukere',
        desc: 'Administrer brukere på siden',
        to: '/dashboard/brukere',
        access: ['webkom'],
    },
    {
        title: 'Tilbakemeldinger',
        desc: 'Se og svar på tilbakemeldinger fra brukere',
        to: '/dashboard/tilbakemeldinger',
        access: ['webkom'],
    },
    {
        title: 'Whitelist',
        desc: 'Legg til brukere på whitelist',
        to: '/dashboard/whitelist',
        access: ['webkom'],
    },
    {
        title: 'Prikkesystem',
        desc: 'Brukere med prikker (bedpres)',
        to: '/dashboard/prikkesystem',
        access: ['webkom', 'bedkom'],
    },
];

const DashboardPage = () => {
    const { user, loading, signedIn, error } = useAuth();
    const [hasAccess, setHasAccess] = useState<boolean>(false);

    const bg = useColorModeValue('gray.200', 'gray.800');

    useEffect(() => {
        if (user) {
            setHasAccess(
                hasOverlap(
                    user.memberships,
                    adminRoutes.flatMap((route) => route.access),
                ),
            );
        }
    }, [user]);

    return (
        <>
            <SEO title="Dashboard" />
            <Section>
                {!signedIn ||
                    (!hasAccess && (
                        <Center flexDirection="column" gap="5" py="10">
                            <Heading>En feil har skjedd.</Heading>
                            <Text>Du har ikke tilgang til denne siden.</Text>
                            <ButtonLink href="/">Tilbake til forsiden</ButtonLink>
                        </Center>
                    ))}
                {error && <ErrorBox error={error.message} />}
                {loading && (
                    <Center flexDirection="column" gap="5" py="10">
                        <Heading>Laster inn...</Heading>
                        <Spinner size="xl" mx="auto" />
                    </Center>
                )}
                {hasAccess && (
                    <>
                        <Heading>Dashboard</Heading>
                        <SimpleGrid columns={[1, null, null, 2]} gap="5">
                            {adminRoutes
                                .filter((route) => hasOverlap(user?.memberships ?? [], route.access))
                                .map((route) => (
                                    <LinkBox key={route.title}>
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
                                                <LinkOverlay as={NextLink} href={route.to}>
                                                    <Text fontWeight="bold" fontSize="2xl">
                                                        {route.title}
                                                    </Text>
                                                </LinkOverlay>
                                                <Text>{route.desc}</Text>
                                            </Flex>
                                        </Box>
                                    </LinkBox>
                                ))}
                        </SimpleGrid>
                    </>
                )}
            </Section>
        </>
    );
};

export default DashboardPage;
