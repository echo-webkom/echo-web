import React from 'react';

import Markdown from 'markdown-to-jsx';
import { GetStaticProps } from 'next';
import Layout from '../components/layout';
import SEO from '../components/seo';
import masterinfo from '../../public/static/for-studenter/masterinfo.md';
import StaticInfo from '../components/static-info';
import MapMarkdownChakra from '../markdown';
import { StudentGroup, StudentGroupAPI } from '../lib/api/student-group';
import StudentGroupSection from '../components/student-group-section';

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
                tabNames={['Undergrupper', 'Underorganisasjoner', 'Masterinfo']}
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
