import React from 'react';

import Markdown from 'markdown-to-jsx';
import { GetStaticProps } from 'next';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import Layout from '../components/layout';
import SEO from '../components/seo';
import underorganisasjoner from '../../public/static/for-studenter/underorganisasjoner.md';
import masterinfo from '../../public/static/for-studenter/masterinfo.md';
import StaticInfo from '../components/static-info';
import MapMarkdownChakra from '../markdown';
import { StudentGroup } from '../lib/types';
import { StudentGroupAPI } from '../lib/api';
import StudentGroupView from '../components/student-group-view';

const ForStudenterPage = ({ studentGroups }: { studentGroups: Array<StudentGroup> }): JSX.Element => {
    return (
        <Layout>
            <SEO title="For studenter" />
            <StaticInfo
                tabNames={['Undergrupper', 'Underorganisasjoner', 'Masterinfo']}
                tabPanels={[
                    <Tabs>
                        <TabList>
                            {studentGroups.map((group: StudentGroup) => (
                                <Tab fontWeight="bold" fontSize="xl">
                                    {group.name}
                                </Tab>
                            ))}
                        </TabList>
                        <TabPanels>
                            {studentGroups.map((group: StudentGroup) => (
                                <TabPanel>
                                    <StudentGroupView group={group} />
                                </TabPanel>
                            ))}
                        </TabPanels>
                    </Tabs>,
                    <Markdown options={MapMarkdownChakra}>{underorganisasjoner}</Markdown>,
                    <Markdown options={MapMarkdownChakra}>{masterinfo}</Markdown>,
                ]}
            />
        </Layout>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const studentGroups = await StudentGroupAPI.getStudentGroups('subgroup');

    return {
        props: {
            studentGroups,
        },
    };
};

export default ForStudenterPage;
