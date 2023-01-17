import {
    useBreakpointValue,
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
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalFooter,
    ModalBody,
} from '@chakra-ui/react';
import { getTime, parseISO, isBefore, isAfter } from 'date-fns';
import { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import ErrorBox from '@components/error-box';
import { RegistrationAPI, type Registration } from '@api/registration';
import Section from '@components/section';
import RegistrationRow from '@components/registration-row';
import useAuth from '@hooks/use-auth';
import RegistrationPieChart from '@components/registration-pie-chart';
import RegistrationsOverTime from '@components/registrations-over-time';
import type { Degree } from '@utils/schemas';
import type { StudentGroup } from '@api/dashboard';
import { isErrorMessage, type ErrorMessage } from '@utils/error';
import capitalize from '@utils/capitalize';

interface Props {
    slug: string;
    title: string;
    registrationDate: Date;
}

const regsFormatter = (regs: Array<Registration>) =>
    regs
        .map((reg, index) => ({
            key: getTime(parseISO(reg.submitDate)),
            value: index + 1,
        }))
        .map((reg, index, array) =>
            array.some((e) => e.key === reg.key && array.indexOf(e) > index)
                ? { key: reg.key - 1, value: reg.value }
                : reg,
        );

const RegistrationsList = ({ slug, title, registrationDate }: Props) => {
    type DegreeType = 'all' | Degree;
    type StudentGroupType = 'all' | StudentGroup;

    const { idToken, signedIn } = useAuth();

    const [registrations, setRegistrations] = useState<Array<Registration>>([]);
    const [error, setError] = useState<ErrorMessage | null>(null);

    const [degree, setDegree] = useState<DegreeType>('all');
    const [year, setYear] = useState<number>(0);
    // -1: ALL, 0: Only waitlist, 1: Only accepted
    const [waitlist, setWaitlist] = useState<number>(-1);
    const [search, setSearch] = useState<string>('');
    const [studentGroup, setStudentGroup] = useState<StudentGroupType>('all');

    const { isOpen, onOpen, onClose } = useDisclosure();

    const filteredRegistrations = registrations
        .filter((reg) => reg.degree === degree || degree === 'all')
        .filter((reg) => reg.degreeYear === year || year === 0)
        .filter((reg) => (waitlist === -1 ? true : waitlist ? reg.waitList : !reg.waitList))
        .filter(
            (reg) =>
                reg.name.toLowerCase().includes(search.toLowerCase()) ||
                (reg.alternateEmail ?? reg.email).toLowerCase().includes(search.toLowerCase()),
        )
        .filter((reg) => reg.memberships.includes(studentGroup) || studentGroup === 'all');

    const numberOfRegistrations = filteredRegistrations.length;

    const questions = registrations
        .flatMap((reg) => reg.answers)
        .map((ans) => ans.question)
        .filter((e, i, arr) => arr.indexOf(e) === i);

    const tableSize = useBreakpointValue({ base: 'sm', lg: 'md' });
    const headingSize = 'md';
    const justifyHeading = useBreakpointValue({ base: 'center', lg: 'left' });

    const registrationsOverTimeBefore = regsFormatter(
        registrations.filter((reg) => !reg.waitList && isBefore(parseISO(reg.submitDate), registrationDate)),
    );

    const registrationsOverTimeAfter = regsFormatter(
        registrations.filter((reg) => !reg.waitList && isAfter(parseISO(reg.submitDate), registrationDate)),
    );

    const hasEarlyRegistrations = registrationsOverTimeBefore.length > 0;

    useEffect(() => {
        const fetchRegs = async () => {
            if (!signedIn || !idToken) return;
            const result = await RegistrationAPI.getRegistrations(slug, idToken);

            if (isErrorMessage(result)) {
                setError(result);
            } else {
                setError(null);
                setRegistrations(result);
            }
        };
        void fetchRegs();
    }, [idToken, signedIn, slug]);

    if (registrations.length === 0 && !error) return <></>;

    return (
        <>
            <Section mt="1rem" minW="100%">
                {error && <ErrorBox error={error.message} />}
                {registrations.length > 0 && !error && (
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
                                            <Button onClick={onOpen} fontSize="sm">
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
                                                onChange={(evt) => setDegree(evt.target.value as DegreeType)}
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
                                            <Text fontSize="md">Studentgruppe:</Text>
                                            <Select
                                                title="Studentgruppe"
                                                value={studentGroup}
                                                onChange={(evt) =>
                                                    setStudentGroup(evt.target.value as StudentGroupType)
                                                }
                                            >
                                                <option value="all">Alle</option>
                                                {registrations
                                                    .flatMap((reg) => reg.memberships)
                                                    .filter((e, i, arr) => arr.indexOf(e) === i)
                                                    .map((sg) => (
                                                        <option key={sg} value={sg}>
                                                            {capitalize(sg)}
                                                        </option>
                                                    ))}
                                            </Select>
                                        </Flex>
                                        <Flex mt="auto">
                                            <Button
                                                onClick={() => {
                                                    setDegree('all');
                                                    setYear(0);
                                                    setWaitlist(-1);
                                                    setSearch('');
                                                    setStudentGroup('all');
                                                }}
                                            >
                                                Nullstill filter
                                            </Button>
                                        </Flex>
                                    </Center>
                                    <Text>Antall resultater: {numberOfRegistrations}</Text>
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
                                                {questions.map((q, index) => (
                                                    <Th key={index}>{q}</Th>
                                                ))}
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
                                    <GridItem>
                                        <Heading size="md" my="1rem">
                                            Antall påmeldinger per undergruppe
                                        </Heading>
                                        <RegistrationPieChart registrations={registrations} field="studentGroup" />
                                    </GridItem>
                                    {hasEarlyRegistrations && (
                                        <GridItem colSpan={[1, 1, null, 2]}>
                                            <Heading size="md" my="2rem">
                                                Antall påmeldinger over tid (tidlig påmelding)
                                            </Heading>
                                            <RegistrationsOverTime data={registrationsOverTimeBefore} />
                                        </GridItem>
                                    )}
                                    <GridItem colSpan={[1, 1, null, 2]}>
                                        <Heading size="md" my="2rem">
                                            {`Antall påmeldinger over tid${
                                                hasEarlyRegistrations ? ' (vanlig påmelding)' : ''
                                            }`}
                                        </Heading>
                                        <RegistrationsOverTime data={registrationsOverTimeAfter} />
                                    </GridItem>
                                </SimpleGrid>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                )}
            </Section>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent mx="5">
                    <ModalHeader>Slett påmelding</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody as={Stack} gap="1">
                        <Text>
                            Dersom du trykker på &quot;Slett påmelding&quot;, blir du spurt om å bekrefte at du vil
                            slette påmeldingen. Dersom du godtar dette, vil påmeldingen bli slettet for alltid. Hvis
                            denne påmeldingen ikke var på venteliste, vil neste person på ventelisten automatisk bli
                            rykket opp i listen. Denne personen får ikke automatisk beskjed om at de ikke lenger er på
                            venteliste; arrangør er ansvarlig for å gjøre dette.
                        </Text>
                        <Text fontWeight="bold">
                            Det beste er å forhøre seg om neste person på venteliste har mulighet til å delta på
                            arrangementet før du sletter en som har meldt seg av.
                        </Text>
                        <Text>
                            Påmeldinger som er slettet blir slettet for alltid, og det er ikke mulig å finne denne
                            informasjonen igjen.
                        </Text>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onClose}>Ok, jeg forstår</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default RegistrationsList;
