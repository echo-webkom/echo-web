import React from 'react';

import { Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react';
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
                <Tabs p="0">
                    <TabList>
                        {studentGroups.map((group: StudentGroup) => (
                            <Tab key={group.name} fontWeight="bold" fontSize="xl">
                                {group.name}
                            </Tab>
                        ))}
                    </TabList>
                    <TabPanels>
                        {studentGroups.map((group: StudentGroup) => (
                            <TabPanel key={group.name}>
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
