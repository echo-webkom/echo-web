import {
    useBreakpointValue,
    useToast,
    Button,
    Divider,
    GridItem,
    Heading,
    SimpleGrid,
    Table,
    Text,
    Thead,
    Tbody,
    Tr,
    Th,
} from '@chakra-ui/react';
import ErrorBox from '@components/error-box';
import ButtonLink from '@components/button-link';
import type { Registration } from '@api/registration';
import Section from '@components/section';
import RegistrationRow from '@components/registration-row';

interface Props {
    registrations: Array<Registration> | null;
    error: string | null;
}

const RegistrationsList = ({ registrations, error }: Props): JSX.Element => {
    const questions =
        registrations
            ?.flatMap((reg) => reg.answers)
            ?.map((ans) => ans.question)
            ?.filter((e, i, arr) => arr.indexOf(e) === i) ?? null;

    const toast = useToast();

    const tableSize = useBreakpointValue({ base: 'sm', lg: 'md' });
    const headingSize = 'md';
    const justifyHeading = useBreakpointValue({ base: 'center', lg: 'left' });

    return (
        <Section minW="100%" overflowX="scroll">
            {error && !registrations && <ErrorBox error={error} />}
            {registrations && registrations.length === 0 && !error && (
                <Heading data-cy="no-regs">Ingen påmeldinger enda</Heading>
            )}
            {registrations && registrations.length > 0 && !error && (
                <>
                    <SimpleGrid p="1rem" columns={[1, null, 4]} alignItems="center">
                        <Heading
                            as={GridItem}
                            size={headingSize}
                            justifySelf={justifyHeading}
                            colSpan={[1, null, 2]}
                        >{`Påmeldinger for '${registrations[0].slug}'`}</Heading>
                        <GridItem>
                            {/* TODO: Fix correct linkTo here */}
                            <ButtonLink linkTo="/" mt="1.5rem" fontSize="sm">
                                Last ned som CSV
                            </ButtonLink>
                        </GridItem>
                        <GridItem>
                            <Button
                                onClick={() => {
                                    toast({
                                        position: 'top',
                                        duration: null,
                                        render: () => (
                                            <Section p="2rem" borderRadius="0.5rem">
                                                <Heading size="lg" pb="0.5rem">
                                                    Slette påmeldinger
                                                </Heading>
                                                <Text py="0.5rem">
                                                    Dersom du trykker på &quot;Slett påmelding&quot;, blir du spurt om å
                                                    bekrefte at du vil slette påmeldingen. Dersom du godtar dette, vil
                                                    påmeldingen bli slettet for alltid. Hvis denne påmeldingen ikke var
                                                    på venteliste, vil neste person på ventelisten automatisk bli rykket
                                                    opp i listen. Denne personen får ikke automatisk beskjed om at de
                                                    ikke lenger er på venteliste; arrangør er ansvarlig for å gjøre
                                                    dette.
                                                </Text>
                                                <Text fontWeight="bold" py="0.5rem">
                                                    Det beste er å forhøre seg om neste person på venteliste har
                                                    mulighet til å delta på arrangementet før du sletter en som har
                                                    meldt seg av.
                                                </Text>
                                                <Text py="0.5rem">
                                                    Påmeldinger som er slettet blir slettet for alltid, og det er ikke
                                                    mulig å finne denne informasjonen igjen.
                                                </Text>
                                                <Button
                                                    onClick={() => {
                                                        toast.closeAll();
                                                    }}
                                                    mt="0.5rem"
                                                >
                                                    Ok, jeg forstår
                                                </Button>
                                            </Section>
                                        ),
                                    });
                                }}
                                mt="1.5rem"
                                fontSize="sm"
                            >
                                Hvordan funker denne listen?
                            </Button>
                        </GridItem>
                    </SimpleGrid>
                    <Divider mb="1em" />
                    <Table size={tableSize} variant="striped">
                        <Thead>
                            <Tr>
                                <Th>Email</Th>
                                <Th>Fornavn</Th>
                                <Th>Etternavn</Th>
                                <Th>Årstrinn</Th>
                                <Th>På venteliste?</Th>
                                <Th>Slett påmelding</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {registrations
                                .sort((a, b) => {
                                    if (a.waitList && !b.waitList) return 1;
                                    else if (!a.waitList && b.waitList) return -1;
                                    else return 0;
                                })
                                .map((reg) => {
                                    return <RegistrationRow key={reg.email} registration={reg} questions={questions} />;
                                })}
                        </Tbody>
                    </Table>
                </>
            )}
        </Section>
    );
};

export default RegistrationsList;
