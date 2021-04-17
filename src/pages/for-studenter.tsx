import React from 'react';

import Markdown from 'markdown-to-jsx';
import { GetStaticProps } from 'next';
import { Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react';
import Layout from '../components/layout';
import SEO from '../components/seo';
import masterinfo from '../../public/static/for-studenter/masterinfo.md';
import StaticInfo from '../components/static-info';
import MapMarkdownChakra from '../markdown';
import { StudentGroup } from '../lib/types';
import { StudentGroupAPI } from '../lib/api';
import StudentGroupView from '../components/student-group-view';

const ForStudenterPage = ({
    subGroups,
    subOrgs,
}: {
    subGroups: Array<StudentGroup>;
    subOrgs: Array<StudentGroup>;
}): JSX.Element => {
    return (
        <Layout>
            <SEO title="For studenter" />
            <StaticInfo
                tabNames={['Undergrupper', 'Underorganisasjoner', 'Masterinfo']}
                tabPanels={[
                    <>
                        {subGroups.length === 0 && <Text>Finner ingen undergrupper :(</Text>}
                        {subGroups.length !== 0 && (
                            <Tabs p="0">
                                <TabList>
                                    {subGroups.map((group: StudentGroup) => (
                                        <Tab fontWeight="bold" fontSize="xl">
                                            {group.name}
                                        </Tab>
                                    ))}
                                </TabList>
                                <TabPanels>
                                    {subGroups.map((group: StudentGroup) => (
                                        <TabPanel>
                                            <StudentGroupView group={group} />
                                        </TabPanel>
                                    ))}
                                </TabPanels>
                            </Tabs>
                        )}
                    </>,
                    <>
                        {subOrgs.length === 0 && <Text>Finner ingen Underorganisasjoner :(</Text>}
                        {subOrgs.length !== 0 && (
                            <Tabs p="0">
                                <TabList>
                                    {subOrgs.map((group: StudentGroup) => (
                                        <Tab fontWeight="bold" fontSize="xl">
                                            {group.name}
                                        </Tab>
                                    ))}
                                </TabList>
                                <TabPanels>
                                    {subOrgs.map((group: StudentGroup) => (
                                        <TabPanel>
                                            <StudentGroupView group={group} />
                                        </TabPanel>
                                    ))}
                                </TabPanels>
                            </Tabs>
                        )}
                    </>,
                    <Markdown options={MapMarkdownChakra}>{masterinfo}</Markdown>,
                ]}
            />
        </Layout>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const subGroups = await StudentGroupAPI.getStudentGroups('subgroup');
    const subOrgs = await StudentGroupAPI.getStudentGroups('suborg');

    return {
        props: {
            subGroups,
            subOrgs,
        },
    };
};

export default ForStudenterPage;
