import type { GetStaticProps } from 'next';
import { useState } from 'react';
import { Heading, Text, Stack, StackDivider } from '@chakra-ui/layout';
import { Select } from '@chakra-ui/select';
import {
    Avatar,
    Box,
    Button,
    Wrap,
    Flex,
    Tag,
    useColorModeValue,
    TableContainer,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Link,
    Td,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import NextLink from 'next/link';
import Section from '@components/section';
import JobAdvertPreview from '@components/job-advert-preview';
import useLanguage from '@hooks/use-language';
import { isErrorMessage } from '@utils/error';
import { type JobAdvert, JobAdvertAPI } from '@api/job-advert';
import translateJobType from '@utils/translate-job-type';
import SEO from '@components/seo';

interface Props {
    jobAdverts: Array<JobAdvert>;
}

type JobType = 'all' | JobAdvert['jobType'];
type SortType = 'deadline' | 'companyName' | '_createdAt' | 'jobType';

interface AggregatedJob {
    isAggregated: boolean;
    companyName: string;
    jobs: Array<JobAdvert>;
    locations: Array<string>;
    jobTypes: Array<JobAdvert['jobType']>;
}

const sortJobs = (list: Array<JobAdvert>, field: SortType) => {
    const sorted = list.sort((a: JobAdvert, b: JobAdvert) => (a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0));
    return field === '_createdAt' ? sorted.reverse() : sorted;
};

const groupJobs = (jobs: Array<JobAdvert>): Array<AggregatedJob> => {
    const grouped: { [key: string]: Array<JobAdvert> } = {};

    for (const job of jobs) {
        const key = `${job.companyName.toLowerCase()}`;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!grouped[key]) {
            grouped[key] = [];
        }

        grouped[key].push(job);
    }

    const result: Array<AggregatedJob> = [];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, jobGroup] of Object.entries(grouped)) {
        const locations = [...new Set(jobGroup.flatMap((job) => job.locations))];
        const jobTypes = [...new Set(jobGroup.map((job) => job.jobType))];

        result.push({
            isAggregated: true,
            companyName: jobGroup[0].companyName,
            jobs: jobGroup,
            jobTypes,
            locations,
        });
    }

    return result;
};

const JobPage = ({ jobAdverts }: Props) => {
    const isNorwegian = useLanguage();
    const [type, setType] = useState<JobType>('all');
    const [location, setLocation] = useState<string>('all');
    const [company, setCompany] = useState<string>('all');
    const [degreeYear, setDegreeYear] = useState<string>('all');
    const [sortBy, setSortBy] = useState<SortType>('deadline');

    const sortedJobs = sortJobs(jobAdverts, sortBy);

    const filteredJobs = sortedJobs.filter((job) => {
        const matchesType = type === 'all' || type === job.jobType;
        const matchesLocation = location === 'all' || job.locations.some((loc) => loc.toLocaleLowerCase() === location);
        const matchesCompany = company === 'all' || company === job.companyName.toLowerCase();
        const matchesDegreeYear = degreeYear === 'all' || job.degreeYears.includes(Number(degreeYear));

        return matchesType && matchesLocation && matchesCompany && matchesDegreeYear;
    });

    const groupedJobs = groupJobs(filteredJobs);

    return (
        <>
            <SEO title="Stillingsannonser" />
            <Section>
                <Heading mb="4">Stillingsannonser</Heading>
                <Stack spacing={5} divider={<StackDivider />}>
                    <Flex direction={['column', null, 'row']} gap="2">
                        <Stack w="100%">
                            <Text>Type</Text>
                            <Select onChange={(evt) => setType(evt.target.value as JobType)} value={type}>
                                <option value="all">Alle</option>
                                <option value="summerjob">Sommerjobb</option>
                                <option value="parttime">Deltid</option>
                                <option value="fulltime">Fulltid</option>
                                <option value="internship">Internship</option>
                                <option value="event">Event</option>
                            </Select>
                        </Stack>
                        <Stack w="100%">
                            <Text>Sted</Text>
                            <Select onChange={(evt) => setLocation(evt.target.value)} value={location}>
                                <option value="all">Alle</option>
                                {[...new Set(jobAdverts.flatMap((job: JobAdvert) => job.locations))].map(
                                    (location: string, index: number) => (
                                        <option
                                            key={`${location.toLocaleLowerCase()}-${index}`}
                                            value={location.toLocaleLowerCase()}
                                        >
                                            {location}
                                        </option>
                                    ),
                                )}
                            </Select>
                        </Stack>
                        <Stack w="100%">
                            <Text>Bedrift</Text>
                            <Select onChange={(evt) => setCompany(evt.target.value)} value={company}>
                                <option value="all">Alle</option>
                                {jobAdverts
                                    .map((job: JobAdvert) => job.companyName)
                                    .filter((value, index, self) => self.indexOf(value) === index) //get unique values
                                    .map((company: string, index: number) => (
                                        <option
                                            key={`${company.toLocaleLowerCase()}-${index}`}
                                            value={company.toLocaleLowerCase()}
                                        >
                                            {company}
                                        </option>
                                    ))}
                            </Select>
                        </Stack>
                        <Stack w="100%">
                            <Text>Årstrinn</Text>
                            <Select onChange={(evt) => setDegreeYear(evt.target.value)} value={degreeYear}>
                                <option value="all">Alle</option>
                                {[...new Set(jobAdverts.flatMap((job: JobAdvert) => job.degreeYears))]
                                    .sort()
                                    .map((year: number, index: number) => (
                                        <option key={`${year}-${index}`} value={year}>
                                            {year}. trinn
                                        </option>
                                    ))}
                            </Select>
                        </Stack>
                        <Stack w="100%">
                            <Text>Sorter etter</Text>
                            <Select onChange={(evt) => setSortBy(evt.target.value as SortType)} value={sortBy}>
                                <option value="deadline">Søknadsfrist</option>
                                <option value="companyName">Bedrift</option>
                                <option value="_createdAt">Publisert</option>
                                <option value="jobType">Type</option>
                            </Select>
                        </Stack>
                    </Flex>

                    {filteredJobs.length > 0 ? (
                        <Stack w="100%" gap="5">
                            {groupedJobs.length === 1
                                ? groupedJobs[0].jobs.map((job) => {
                                      return <JobAdvertPreview key={job.slug} jobAdvert={job} />;
                                  })
                                : groupedJobs.map((group) => {
                                      const key = `${group.companyName}`;

                                      if (group.jobs.length === 1) {
                                          const job = group.jobs[0];
                                          return <JobAdvertPreview key={key} jobAdvert={job} />;
                                      }

                                      return <JobGroupPreview key={key} group={group} />;
                                  })}
                        </Stack>
                    ) : (
                        <Text>{isNorwegian ? 'Ingen stillingsannonser :(' : 'No job advertisements :('}</Text>
                    )}
                </Stack>
            </Section>
        </>
    );
};

const JobGroupPreview = ({ group }: { group: AggregatedJob }) => {
    const isNorwegian = useLanguage();
    const bgColor = useColorModeValue('bg.light.tertiary', 'bg.dark.tertiary');

    const [show, setShow] = useState(false);

    const title = isNorwegian ? `Jobber hos ${group.companyName}` : `Jobs at ${group.companyName}`;

    return (
        <Box
            w="100%"
            p="1rem"
            my="1rem"
            pos="relative"
            height="100%"
            bg={bgColor}
            border="2px"
            borderColor="transparent"
            borderRadius="0.5rem"
        >
            <Stack gap="5">
                <Flex direction={['column', 'row']} alignItems={['center', 'start']} gap="3">
                    <Avatar size="2xl" src={group.jobs[0].logoUrl} />
                    <Stack>
                        <Text fontWeight="bold" fontSize={['1.4rem', null, null, '2rem']}>
                            {title}
                        </Text>
                        <Stack>
                            <Wrap>
                                {group.jobTypes.map((jobType, i) => (
                                    <Tag colorScheme="teal" variant="subtle" key={`${jobType}-${i}`}>
                                        {translateJobType(jobType, isNorwegian)}
                                    </Tag>
                                ))}
                            </Wrap>
                            <Wrap>
                                {group.locations.map((location, i) => (
                                    <Tag colorScheme="teal" variant="solid" key={`${location}-${i}`}>
                                        {location}
                                    </Tag>
                                ))}
                            </Wrap>
                        </Stack>
                    </Stack>
                </Flex>

                <Button variant="outline" onClick={() => setShow((prev) => !prev)}>
                    {isNorwegian
                        ? `${show ? 'Skjul' : 'Vis'} ${group.jobs.length} jobber`
                        : `${show ? 'Hide' : 'Show'} ${group.jobs.length} jobs`}
                </Button>

                {show && (
                    <TableContainer>
                        <Table>
                            <Thead>
                                <Tr>
                                    <Th>Tittel</Th>
                                    <Th>Sted</Th>
                                    <Th>Frist</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {group.jobs.map((job) => {
                                    return <JobAdRow key={job.slug} job={job} />;
                                })}
                            </Tbody>
                        </Table>
                    </TableContainer>
                )}
            </Stack>
        </Box>
    );
};

const JobAdRow = ({ job }: { job: JobAdvert }) => {
    return (
        <Tr>
            <Td>
                <Link as={NextLink} href={`/jobb/${job.slug}`}>
                    {job.title.length > 30 ? `${job.title.slice(0, 30)}...` : job.title}
                </Link>
            </Td>
            <Td>{job.locations.join(', ')}</Td>
            <Td>{format(new Date(job.deadline), 'dd.MM.yyyy')}</Td>
        </Tr>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    if (process.env.NEXT_PUBLIC_ENABLE_JOB_ADVERTS?.toLowerCase() !== 'true') {
        return {
            notFound: true,
        };
    }

    const jobAdverts = await JobAdvertAPI.getJobAdverts(100);

    if (isErrorMessage(jobAdverts)) throw new Error(jobAdverts.message);

    const props: Props = {
        jobAdverts,
    };

    return {
        props,
    };
};

export default JobPage;
