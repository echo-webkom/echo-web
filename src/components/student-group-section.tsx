import React from 'react';

import { Divider, Tab, TabList, TabPanel, TabPanels, Tabs, Text, Wrap } from '@chakra-ui/react';
import { StudentGroup } from '../lib/types';
import StudentGroupView from './student-group-view';

const StudentGroupSection = ({
    studentGroups,
    groupType,
}: {
    studentGroups: Array<StudentGroup>;
    groupType: string;
}): JSX.Element => {
    return (
        <>
            {studentGroups.length === 0 && <Text>Finner ingen {groupType} :(</Text>}
            {studentGroups.length !== 0 && (
                <Tabs variant="soft-rounded" p="0">
                    <TabList>
                        <Wrap justify="center">
                            {studentGroups.map((group: StudentGroup) => (
                                <Tab key={group.name} fontWeight="bold" fontSize="xl">
                                    {group.name}
                                </Tab>
                            ))}
                        </Wrap>
                    </TabList>
                    <Divider my=".5em" />
                    <TabPanels>
                        {studentGroups.map((group: StudentGroup) => (
                            <TabPanel p="0" key={group.name}>
                                <StudentGroupView group={group} />
                            </TabPanel>
                        ))}
                    </TabPanels>
                </Tabs>
            )}
        </>
    );
};

export default StudentGroupSection;
