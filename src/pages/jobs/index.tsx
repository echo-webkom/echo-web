import { Grid, Text, VStack, Wrap } from '@chakra-ui/layout';
import { Select } from '@chakra-ui/select';
import { GetStaticProps } from 'next';
import React, { useState } from 'react';
import ErrorBox from '../../components/error-box';
import JobAdvertPreview from '../../components/job-advert-preview';
import Section from '../../components/section';
import { JobAdvert, JobAdvertAPI } from '../../lib/api';

interface Props {
    jobAdverts: JobAdvert[];
    error: string;
}

type JobType = 'all' | 'fulltime' | 'parttime' | 'internship';
type SortType = 'deadline' | 'companyName' | '_createdAt' | 'jobType';

const sortJobs = (list: JobAdvert[], field: SortType) => {
    const sorted = list.sort((a: JobAdvert, b: JobAdvert) => (a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0));
    return field === '_createdAt' ? sorted.reverse() : sorted;
};

const JobAdvertPage = ({ jobAdverts, error }: Props): JSX.Element => {
    const [type, setType] = useState<JobType>('all');
    const [location, setLocation] = useState<string>('all');
    const [company, setCompany] = useState<string>('all');
    const [sortBy, setSortBy] = useState<SortType>('deadline');

    return (
        <>
            {error && <ErrorBox error={error} />}
            {!error && jobAdverts && (
                <Grid alignItems="start" templateColumns="1fr 4fr" gap={5}>
                    <Section>
                        <VStack spacing={2}>
                            <Text>Type</Text>
                            <Select onChange={(evt) => setType(evt.target.value as JobType)} value={type}>
                                <option value="all">Alle</option>
                                <option value="internship">Sommerjobb</option>
                                <option value="parttime">Deltid</option>
                                <option value="fulltime">Fulltid</option>
                            </Select>
                            <Text>Sted</Text>
                            <Select onChange={(evt) => setLocation(evt.target.value)} value={location}>
                                <option value="all">Alle</option>
                                {jobAdverts
                                    .map((job: JobAdvert) => job.location)
                                    .filter((value, index, self) => self.indexOf(value) === index) //get unique values
                                    .map((location: string, index: number) => (
                                        <option
                                            key={`${location.toLocaleLowerCase()}-${index}`}
                                            value={location.toLowerCase()}
                                        >
                                            {location}
                                        </option>
                                    ))}
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
                                            value={company.toLowerCase()}
                                        >
                                            {company}
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
                        </VStack>
                    </Section>
                    <Wrap spacing={5}>
                        {sortJobs(jobAdverts, sortBy).map((job: JobAdvert) =>
                            (type === job.jobType || type === 'all') &&
                            (location === job.location.toLowerCase() || location === 'all') &&
                            (company === job.companyName.toLowerCase() || company === 'all') ? (
                                <JobAdvertPreview key={job.slug} jobAdvert={job} />
                            ) : null,
                        )}
                    </Wrap>
                </Grid>
            )}
        </>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const { jobAdverts, error } = await JobAdvertAPI.getJobAdverts(10);

    return {
        props: {
            jobAdverts,
            error,
        },
    };
};

export default JobAdvertPage;
