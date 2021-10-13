import Markdown from 'markdown-to-jsx';
import { GetStaticProps } from 'next';
import React from 'react';
import anononymeTilbakemeldinger from '../../public/static/for-studenter/anonymeTilbakemeldinger.md';
import masterinfo from '../../public/static/for-studenter/masterinfo.md';
import okonomiskStotte from '../../public/static/for-studenter/okonomiskStotte.md';
import utleggsskjema from '../../public/static/for-studenter/utleggsskjema.md';
import Layout from '../components/layout';
import SEO from '../components/seo';
import StaticInfo from '../components/static-info';
import StudentGroupSection from '../components/student-group-section';
import { StudentGroup, StudentGroupAPI } from '../lib/api';
import MapMarkdownChakra from '../markdown';

const ForStudenterPage = ({
    subGroups,
    subGroupsError,
    subOrgs,
    subOrgsError,
}: {
    subGroups: Array<StudentGroup>;
    subGroupsError: string;
    subOrgs: Array<StudentGroup>;
    subOrgsError: string;
}): JSX.Element => {
    return (
        <Layout>
            <SEO title="For studenter" />
            <StaticInfo
                tabNames={[
                    'Undergrupper',
                    'Underorganisasjoner',
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
        </Layout>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const subGroups = await StudentGroupAPI.getStudentGroupsByType('subgroup');
    const subOrgs = await StudentGroupAPI.getStudentGroupsByType('suborg');

    return {
        props: {
            subGroups: subGroups.studentGroups,
            subGroupsError: subGroups.error,
            subOrgs: subOrgs.studentGroups,
            subOrgsError: subOrgs.error,
        },
    };
};

export default ForStudenterPage;
