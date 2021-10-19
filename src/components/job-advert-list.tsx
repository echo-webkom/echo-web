import React from 'react';
import { JobAdvert } from '../lib/api';
import EntryBox from './entry-box';

interface Props {
    jobAdverts: Array<JobAdvert> | null;
    error: string | null;
}

const JobAdvertList = ({ jobAdverts, error }: Props): JSX.Element => {
    return (
        <EntryBox
            title="Stillingsannonser"
            titles={jobAdverts?.map((ja: JobAdvert) => ja.companyName)}
            entries={jobAdverts}
            entryLimit={6}
            error={error}
            type="job-advert"
            direction="row"
        />
    );
};

export default JobAdvertList;
