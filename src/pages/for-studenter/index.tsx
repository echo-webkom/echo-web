import Markdown from 'markdown-to-jsx';
import { GetServerSideProps } from 'next';
import React from 'react';
import anononymeTilbakemeldinger from '../../../public/static/for-studenter/anonymeTilbakemeldinger.md';
import masterinfo from '../../../public/static/for-studenter/masterinfo.md';
import okonomiskStotte from '../../../public/static/for-studenter/okonomiskStotte.md';
import utleggsskjema from '../../../public/static/for-studenter/utleggsskjema.md';
import SEO from '../../components/seo';
import InfoPanels from '../../components/info-panels';
import StudentGroupSection from '../../components/student-group-section';
import { StudentGroup, StudentGroupAPI } from '../../lib/api';
import MapMarkdownChakra from '../../markdown';

interface Props {
    subGroups: Array<StudentGroup> | null;
    subGroupsError: string | null;
    subOrgs: Array<StudentGroup> | null;
    subOrgsError: string | null;
    intGroups: Array<StudentGroup> | null;
    intGroupsError: string | null;
}

const ForStudenterPage = ({
    subGroups,
    subGroupsError,
    subOrgs,
    subOrgsError,
    intGroups,
    intGroupsError,
}: Props): JSX.Element => {
    return (
        <>
            <SEO title="For studenter" />
            <InfoPanels
                tabNames={[
                    'Undergrupper',
                    'Underorganisasjoner',
                    'Interessegrupper',
                    'Masterinfo',
                    'Økonomisk støtte',
                    'Anonyme tilbakemeldinger',
                    'Utlegg på vegne av echo',
                ]}
                tabPanels={[
                    <StudentGroupSection
                        key="undergrupper"
                        studentGroups={subGroups}
                        error={subGroupsError}
                        groupType="undergrupper"
                    />,
                    <StudentGroupSection
                        key="underorganisasjoner"
                        studentGroups={subOrgs}
                        error={subOrgsError}
                        groupType="underorganisasjoner"
                    />,
                    <StudentGroupSection
                        key="interessegrupper"
                        studentGroups={intGroups}
                        error={intGroupsError}
                        groupType="interessegrupper"
                    />,
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
                ]}
            />
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async () => {
    const subGroups = await StudentGroupAPI.getStudentGroupsByType('subgroup');
    const subOrgs = await StudentGroupAPI.getStudentGroupsByType('suborg');
    const intGroups = await StudentGroupAPI.getStudentGroupsByType('intgroup');

    const props: Props = {
        intGroups: intGroups.studentGroups,
        intGroupsError: intGroups.error,
        subGroups: subGroups.studentGroups,
        subGroupsError: subGroups.error,
        subOrgs: subOrgs.studentGroups,
        subOrgsError: subOrgs.error,
    };

    return {
        props,
    };
};

export default ForStudenterPage;
