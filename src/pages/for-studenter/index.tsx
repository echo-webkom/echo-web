import Markdown from 'markdown-to-jsx';
import { GetStaticProps } from 'next';
import React from 'react';
import anononymeTilbakemeldinger from '../../../public/static/for-studenter/anonymeTilbakemeldinger.md';
import masterinfo from '../../../public/static/for-studenter/masterinfo.md';
import okonomiskStotte from '../../../public/static/for-studenter/okonomiskStotte.md';
import utleggsskjema from '../../../public/static/for-studenter/utleggsskjema.md';
import JobAdvertOverview from '../../components/job-advert-overview';
import SEO from '../../components/seo';
import InfoPanels from '../../components/info-panels';
import StudentGroupSection from '../../components/student-group-section';
import { isErrorMessage, StudentGroup, StudentGroupAPI, JobAdvert, JobAdvertAPI } from '../../lib/api';
import MapMarkdownChakra from '../../markdown';

interface Props {
    subGroups: Array<StudentGroup>;
    subOrgs: Array<StudentGroup>;
    intGroups: Array<StudentGroup>;
    jobAdverts: Array<JobAdvert>;
    enableJobAdverts: boolean;
}

const ForStudenterPage = ({ subGroups, subOrgs, intGroups, jobAdverts, enableJobAdverts }: Props): JSX.Element => {
    return (
        <>
            <SEO title="For studenter" />
            <InfoPanels
                tabNames={[
                    'Undergrupper',
                    'Underorganisasjoner',
                    'Interessegrupper',
                    'Stillingsannonser',
                    'Masterinfo',
                    'Økonomisk støtte',
                    'Anonyme tilbakemeldinger',
                    'Utlegg på vegne av echo',
                ].filter((v) => enableJobAdverts || v !== 'Stillingsannonser')}
                tabPanels={[
                    <StudentGroupSection
                        key="undergrupper"
                        studentGroups={subGroups}
                        groupType="undergrupper"
                        groupDefinition="En undergruppe er en utvidelse av echos virksomhet;
                        undergruppen utfører et nødvendig arbeid Styret ellers ville ha gjort."
                    />,
                    <StudentGroupSection
                        key="underorganisasjoner"
                        studentGroups={subOrgs}
                        groupType="underorganisasjoner"
                        groupDefinition="En autonom organisasjon som utfører deler av echo sin virksomhet,
                        en som av ulike grunner ikke egner seg som undergruppe. Organisasjonen har et tett
                        samarbeid med echo."
                    />,
                    <StudentGroupSection
                        key="interessegrupper"
                        studentGroups={intGroups}
                        groupType="interessegrupper"
                        groupDefinition="Grupper som legger til rette for en fritidsinteresse blant
                        våre studenter, i samråd med echo."
                    />,
                    <JobAdvertOverview key="stillingsannonser" jobAdverts={jobAdverts} />,
                    <Markdown key="masterinfo" options={{ overrides: MapMarkdownChakra }}>
                        {masterinfo}
                    </Markdown>,
                    <Markdown key="okonomisk-stotte" options={{ overrides: MapMarkdownChakra }}>
                        {okonomiskStotte}
                    </Markdown>,
                    <Markdown key="anononyme-tilbakemeldinger" options={{ overrides: MapMarkdownChakra }}>
                        {anononymeTilbakemeldinger}
                    </Markdown>,
                    <Markdown key="utleggsskjema" options={{ overrides: MapMarkdownChakra }}>
                        {utleggsskjema}
                    </Markdown>,
                ].filter((c) => enableJobAdverts || c.key !== 'stillingsannonser')}
            />
        </>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const subGroups = await StudentGroupAPI.getStudentGroupsByType('subgroup');
    const subOrgs = await StudentGroupAPI.getStudentGroupsByType('suborg');
    const intGroups = await StudentGroupAPI.getStudentGroupsByType('intgroup');
    const jobAdverts = await JobAdvertAPI.getJobAdverts(10);
    const enableJobAdverts = process.env.ENABLE_JOB_ADVERTS?.toLowerCase() === 'true';

    if (isErrorMessage(subGroups)) throw new Error(subGroups.message);
    if (isErrorMessage(subOrgs)) throw new Error(subOrgs.message);
    if (isErrorMessage(intGroups)) throw new Error(intGroups.message);
    if (isErrorMessage(jobAdverts)) throw new Error(jobAdverts.message);

    const props: Props = {
        intGroups,
        subGroups,
        subOrgs,
        jobAdverts,
        enableJobAdverts,
    };

    return {
        props,
    };
};

export default ForStudenterPage;
