import { Text, Stack, StackDivider } from '@chakra-ui/layout';
import { Select } from '@chakra-ui/select';
import { useState } from 'react';
import type { JobAdvert } from '@api/job-advert';
import JobAdvertPreview from '@components/job-advert-preview';
import useLanguage from '@hooks/use-language';

interface Props {
    jobAdverts: Array<JobAdvert>;
}

type JobType = 'all' | 'fulltime' | 'parttime' | 'internship' | 'summerjob';
type SortType = 'deadline' | 'companyName' | '_createdAt' | 'jobType';

const sortJobs = (list: Array<JobAdvert>, field: SortType) => {
    const sorted = list.sort((a: JobAdvert, b: JobAdvert) => (a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0));
    return field === '_createdAt' ? sorted.reverse() : sorted;
};

const JobAdvertOverview = ({ jobAdverts }: Props): JSX.Element => {
    const isNorwegian = useLanguage();
    const [type, setType] = useState<JobType>('all');
    const [location, setLocation] = useState<string>('all');
    const [company, setCompany] = useState<string>('all');
    const [degreeYear, setDegreeYear] = useState<string>('all');
    const [sortBy, setSortBy] = useState<SortType>('deadline');

    return (
        <>
            <Stack direction={['column', null, null, 'row']} spacing={5} divider={<StackDivider />}>
                <Stack spacing={2}>
                    <Text>Type</Text>
                    <Select onChange={(evt) => setType(evt.target.value as JobType)} value={type}>
                        <option value="all">Alle</option>
                        <option value="summerjob">Sommerjobb</option>
                        <option value="parttime">Deltid</option>
                        <option value="fulltime">Fulltid</option>
                        <option value="internship">Internship</option>
                    </Select>
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
                    <Text>Sorter etter</Text>
                    <Select onChange={(evt) => setSortBy(evt.target.value as SortType)} value={sortBy}>
                        <option value="deadline">Søknadsfrist</option>
                        <option value="companyName">Bedrift</option>
                        <option value="_createdAt">Publisert</option>
                        <option value="jobType">Type</option>
                    </Select>
                </Stack>
                {jobAdverts.length > 0 ? (
                    <Stack w="100%" gap="5">
                        <div>{jobAdverts.length}</div>
                        {sortJobs(jobAdverts, sortBy).map((job: JobAdvert) =>
                            (type === job.jobType || type === 'all') &&
                            (job.locations.some((locations) => locations.toLocaleLowerCase() === location) ||
                                location === 'all') &&
                            (job.degreeYears.includes(Number(degreeYear)) || degreeYear === 'all') &&
                            (company === job.companyName.toLowerCase() || company === 'all') ? (
                                <JobAdvertPreview key={job.slug} jobAdvert={job} />
                            ) : null,
                        )}
                    </Stack>
                ) : (
                    <Text>{isNorwegian ? 'Ingen stillingsannonser :(' : 'No job advertisements :('}</Text>
                )}
            </Stack>
        </>
    );
};

export default JobAdvertOverview;
