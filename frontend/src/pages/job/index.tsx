import React from 'react';
import { GetStaticProps } from 'next';
import { JobAdvert, JobAdvertAPI, isErrorMessage } from '../../lib/api';
import JobAdvertOverview from '../../components/job-advert-overview';
import Section from '../../components/section';

interface Props {
    jobAdverts: Array<JobAdvert>;
}

const JobPage = ({ jobAdverts }: Props) => {
    return (
        <Section>
            <JobAdvertOverview jobAdverts={jobAdverts} />;
        </Section>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    if (process.env.ENABLE_JOB_ADVERTS?.toLowerCase() !== 'true') {
        return {
            notFound: true,
        };
    }

    const jobAdverts = await JobAdvertAPI.getJobAdverts(10);

    if (isErrorMessage(jobAdverts)) throw new Error(jobAdverts.message);

    const props: Props = {
        jobAdverts,
    };

    return {
        props,
    };
};

export default JobPage;
