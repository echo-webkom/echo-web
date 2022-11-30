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
    Center,
    Select,
    Stack,
    Td,
    Input,
    InputRightElement,
    InputGroup,
    IconButton,
} from '@chakra-ui/react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { getTime, format, parseISO } from 'date-fns';
import { useState } from 'react';
import { MdClose } from 'react-icons/md';
import ErrorBox from '@components/error-box';
import type { Registration } from '@api/registration';
import Section from '@components/section';
import RegistrationRow from '@components/registration-row';
import notEmptyOrNull from '@utils/not-empty-or-null';
import RegistrationPieChart from '@components/registration-pie-chart';
import type { Degree } from '@utils/decoders';
import hasOverlap from '@utils/has-overlap';

interface Props {
    registrations: Array<Registration> | null;
    error: string | null;
    title: string;
    studentGroups: Array<string> | null;
}

const RegistrationsList = ({ registrations, title, error, studentGroups }: Props) => {
    type DegreeType = 'all' | Degree;

    const [degree, setDegree] = useState<DegreeType>('all');
    const [year, setYear] = useState<number>(0);
    // -1: ALL, 0: Only waitlist, 1: Only accepted
    const [waitlist, setWaitlist] = useState<number>(-1);
    const [search, setSearch] = useState<string>('');
    const [hideStudentGroups, setHideStudentGroups] = useState<boolean>(false);

    const filteredRegistrations =
        registrations
            ?.filter((reg) => reg.degree === degree || degree === 'all')
            ?.filter((reg) => reg.degreeYear === year || year === 0)
            ?.filter((reg) => (waitlist === -1 ? true : waitlist ? reg.waitList : !reg.waitList))
            ?.filter(
                (reg) =>
                    reg.name.toLowerCase().includes(search.toLowerCase()) ||
                    (reg.alternateEmail ?? reg.email).toLowerCase().includes(search.toLowerCase()),
            )
            ?.filter(
                (reg) =>
                    !(notEmptyOrNull(studentGroups) && hasOverlap(reg.memberships, studentGroups) && hideStudentGroups),
            ) ?? [];

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
        <Section mt="1rem" minW="100%">
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
                        <TabPanel px="0">
                            <Stack gap="3">
                                <Flex gap="3" alignItems="center" direction={['column', null, null, null, 'row']}>
                                    <Heading size={headingSize} justifySelf={justifyHeading}>
                                        Påmeldinger for: {title}
                                    </Heading>
                                    <Spacer />
                                    <Center alignItems="inherit" gap="3" flexWrap="wrap">
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
                                                                Dersom du trykker på &quot;Slett påmelding&quot;, blir
                                                                du spurt om å bekrefte at du vil slette påmeldingen.
                                                                Dersom du godtar dette, vil påmeldingen bli slettet for
                                                                alltid. Hvis denne påmeldingen ikke var på venteliste,
                                                                vil neste person på ventelisten automatisk bli rykket
                                                                opp i listen. Denne personen får ikke automatisk beskjed
                                                                om at de ikke lenger er på venteliste; arrangør er
                                                                ansvarlig for å gjøre dette.
                                                            </Text>
                                                            <Text fontWeight="bold" py="0.5rem">
                                                                Det beste er å forhøre seg om neste person på venteliste
                                                                har mulighet til å delta på arrangementet før du sletter
                                                                en som har meldt seg av.
                                                            </Text>
                                                            <Text py="0.5rem">
                                                                Påmeldinger som er slettet blir slettet for alltid, og
                                                                det er ikke mulig å finne denne informasjonen igjen.
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
                                    </Center>
                                </Flex>
                                <Center gap="3" flexDirection={['column', null, 'row']} w={['full', null, 'full']}>
                                    <Flex direction="column" w="full">
                                        <Text px="0.8rem" fontSize="md">
                                            Søk:
                                        </Text>
                                        <InputGroup>
                                            <Input
                                                title="Søk på navn eller e-post"
                                                placeholder="Søk på navn eller e-post"
                                                value={search}
                                                onChange={(evt) => setSearch(evt.target.value)}
                                            />
                                            <InputRightElement>
                                                <IconButton
                                                    aria-label="Fjern søk"
                                                    icon={<MdClose />}
                                                    onClick={() => setSearch('')}
                                                    variant="ghost"
                                                    size="sm"
                                                />
                                            </InputRightElement>
                                        </InputGroup>
                                    </Flex>
                                    <Flex direction="column" w="full">
                                        <Text px="0.8rem" fontSize="md">
                                            Studieretning:
                                        </Text>
                                        <Select
                                            title="Studieretning"
                                            value={degree}
                                            onChange={(evt) => setDegree(evt.target.value as Degree | 'all')}
                                        >
                                            <option value="all">Alle</option>
                                            {registrations
                                                .map((reg) => reg.degree)
                                                .filter((e, i, arr) => arr.indexOf(e) === i)
                                                .map((degree) => (
                                                    <option key={degree} value={degree}>
                                                        {degree}
                                                    </option>
                                                ))}
                                        </Select>
                                    </Flex>
                                    <Flex direction="column" w="full">
                                        <Text px="0.8rem" fontSize="md">
                                            Årstrinn:
                                        </Text>
                                        <Select
                                            title="Årstrinn"
                                            value={year}
                                            onChange={(evt) => setYear(Number.parseInt(evt.target.value))}
                                        >
                                            <option value={0}>Alle</option>
                                            {registrations
                                                .map((reg) => reg.degreeYear)
                                                .filter((e, i, arr) => arr.indexOf(e) === i)
                                                .sort((a, b) => a - b)
                                                .map((year) => (
                                                    <option key={year} value={year}>
                                                        {year}
                                                    </option>
                                                ))}
                                        </Select>
                                    </Flex>
                                    <Flex direction="column" w="full">
                                        <Text px="0.8rem" fontSize="md">
                                            Venteliste:
                                        </Text>
                                        <Select
                                            title="Venteliste"
                                            value={waitlist}
                                            onChange={(evt) => setWaitlist(Number.parseInt(evt.target.value))}
                                        >
                                            <option value={-1}>Alle</option>
                                            <option value={1}>Bare venteliste</option>
                                            <option value={0}>Uten venteliste</option>
                                        </Select>
                                    </Flex>
                                    <Flex direction="column" w="full">
                                        <Text fontSize="md">Skjul studentgruppepåmeldinger:</Text>
                                        <Select
                                            title="Skjul studentgrupperpåmeldinger"
                                            value={hideStudentGroups ? 'ja' : 'nei'}
                                            onChange={(evt) =>
                                                setHideStudentGroups(evt.target.value === 'nei' ? false : true)
                                            }
                                        >
                                            <option value="nei">Nei</option>
                                            <option value="ja">Ja</option>
                                        </Select>
                                    </Flex>
                                    <Flex mt="auto">
                                        <Button
                                            onClick={() => {
                                                setDegree('all');
                                                setYear(0);
                                                setWaitlist(-1);
                                                setSearch('');
                                                setHideStudentGroups(false);
                                            }}
                                        >
                                            Nullstill filter
                                        </Button>
                                    </Flex>
                                </Center>
                            </Stack>
                            <Divider my="1rem" />
                            {/* mx value is the the negative of Section padding */}
                            <Box overflowX="scroll" mx="-6">
                                <Table size={tableSize} variant="striped">
                                    <Thead>
                                        <Tr>
                                            <Th>Email</Th>
                                            <Th>Navn</Th>
                                            <Th>Studieretning</Th>
                                            <Th>Årstrinn</Th>
                                            {notEmptyOrNull(questions) &&
                                                questions.map((q, index) => <Th key={index}>{q}</Th>)}
                                            <Th>På venteliste?</Th>
                                            <Th>Medlem av</Th>
                                            <Th>Slett påmelding</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filteredRegistrations
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
                                                        studentGroups={studentGroups}
                                                    />
                                                );
                                            })}
                                        {filteredRegistrations.length === 0 && (
                                            <Td colSpan={100} fontSize="3xl" py="10">
                                                <Center>
                                                    <Text>Ingen påmeldinger som passer dine kriterier</Text>
                                                </Center>
                                            </Td>
                                        )}
                                    </Tbody>
                                </Table>
                            </Box>
                        </TabPanel>
                        <TabPanel px="0">
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
                                                domain={['dataMin', 'dataMax']}
                                            />
                                            <YAxis allowDecimals={false} domain={['dataMin', 'dataMax']} />
                                            <Tooltip
                                                labelFormatter={(label) => format(label, 'HH:mm:ss')}
                                                formatter={(value) => [value, 'Antall påmeldinger']}
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    color: 'black',
                                                }}
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
