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
    Tabs,
    TabList,
    Tab,
    TabPanel,
    TabPanels,
    Flex,
    Spacer,
    Box,
} from '@chakra-ui/react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { getTime, format, parseISO } from 'date-fns';
import ErrorBox from '@components/error-box';
import type { Registration } from '@api/registration';
import Section from '@components/section';
import RegistrationRow from '@components/registration-row';
import notEmptyOrNull from '@utils/not-empty-or-null';
import RegistrationPieChart from '@components/registration-pie-chart';

interface Props {
    registrations: Array<Registration> | null;
    error: string | null;
    title: string;
}

const RegistrationsList = ({ registrations, title, error }: Props): JSX.Element => {
    const questions =
        registrations
            ?.flatMap((reg) => reg.answers)
            ?.map((ans) => ans.question)
            ?.filter((e, i, arr) => arr.indexOf(e) === i) ?? null;

    const toast = useToast();

    const tableSize = useBreakpointValue({ base: 'sm', lg: 'md' });
    const headingSize = 'md';
    const justifyHeading = useBreakpointValue({ base: 'center', lg: 'left' });

    const registrationsOverTime = registrations
        ?.filter((reg) => !reg.waitList)
        ?.map((reg, index) => ({
            key: getTime(parseISO(reg.submitDate)),
            value: index + 1,
        }));

    return (
        <Section mt="1rem" minW="100%" overflowX="scroll">
            {error && !registrations && <ErrorBox error={error} />}
            {registrations && registrations.length === 0 && !error && (
                <Heading data-cy="no-regs">Ingen påmeldinger enda</Heading>
            )}
            {registrations && registrations.length > 0 && !error && (
                <Tabs>
                    <TabList>
                        <Tab>Påmeldinger</Tab>
                        <Tab>Statistikk</Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            <Flex gap="3" alignItems="center">
                                <Heading size={headingSize} justifySelf={justifyHeading}>
                                    Påmeldinger for: {title}
                                </Heading>
                                <Spacer />
                                <a
                                    href={`/api/registration?slug=${registrations[0].slug}&type=download`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                >
                                    <Button fontSize="sm">Last ned som CSV</Button>
                                </a>
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
                                                        Dersom du trykker på &quot;Slett påmelding&quot;, blir du spurt
                                                        om å bekrefte at du vil slette påmeldingen. Dersom du godtar
                                                        dette, vil påmeldingen bli slettet for alltid. Hvis denne
                                                        påmeldingen ikke var på venteliste, vil neste person på
                                                        ventelisten automatisk bli rykket opp i listen. Denne personen
                                                        får ikke automatisk beskjed om at de ikke lenger er på
                                                        venteliste; arrangør er ansvarlig for å gjøre dette.
                                                    </Text>
                                                    <Text fontWeight="bold" py="0.5rem">
                                                        Det beste er å forhøre seg om neste person på venteliste har
                                                        mulighet til å delta på arrangementet før du sletter en som har
                                                        meldt seg av.
                                                    </Text>
                                                    <Text py="0.5rem">
                                                        Påmeldinger som er slettet blir slettet for alltid, og det er
                                                        ikke mulig å finne denne informasjonen igjen.
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
                                    fontSize="sm"
                                >
                                    Hvordan funker denne listen?
                                </Button>
                            </Flex>
                            <Divider my="1rem" />
                            <Box overflowX="scroll">
                                <Table size={tableSize} variant="striped">
                                    <Thead>
                                        <Tr>
                                            <Th>Email</Th>
                                            <Th>Fornavn</Th>
                                            <Th>Etternavn</Th>
                                            <Th>Studieretning</Th>
                                            <Th>Årstrinn</Th>
                                            {notEmptyOrNull(questions) &&
                                                questions.map((q, index) => <Th key={index}>{q}</Th>)}
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
                                                return (
                                                    <RegistrationRow
                                                        key={reg.email}
                                                        registration={reg}
                                                        questions={questions}
                                                    />
                                                );
                                            })}
                                    </Tbody>
                                </Table>
                            </Box>
                        </TabPanel>
                        <TabPanel>
                            <SimpleGrid columns={[1, 1, null, 2]} spacing="1rem">
                                <GridItem>
                                    <Heading size="md" my="1rem">
                                        Antall påmeldinger per studieretning
                                    </Heading>
                                    <RegistrationPieChart registrations={registrations} field="degree" />
                                </GridItem>
                                <GridItem>
                                    <Heading size="md" my="1rem">
                                        Antall påmeldinger per år
                                    </Heading>
                                    <RegistrationPieChart registrations={registrations} field="year" />
                                </GridItem>
                                <GridItem colSpan={[1, 1, null, 2]}>
                                    <Heading size="md" my="2rem">
                                        Antall påmeldinger over tid
                                    </Heading>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <LineChart width={500} height={300} data={registrationsOverTime}>
                                            <XAxis
                                                dataKey="key"
                                                scale="linear"
                                                tickFormatter={(value) => format(value, 'HH:mm:ss')}
                                            />
                                            <YAxis />
                                            <Tooltip
                                                labelFormatter={(label) => format(label, 'HH:mm:ss')}
                                                formatter={(value) => [value, 'Antall påmeldinger']}
                                            />
                                            <CartesianGrid strokeDasharray="3 3" scale="linear" />
                                            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth="1.5" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </GridItem>
                            </SimpleGrid>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            )}
        </Section>
    );
};

export default RegistrationsList;
