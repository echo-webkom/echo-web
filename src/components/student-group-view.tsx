import { Divider, Wrap, WrapItem } from '@chakra-ui/react';
import Markdown from 'markdown-to-jsx';
import React from 'react';
import { Profile, Role, StudentGroup } from '../lib/api/student-group';
import MapMarkdownChakra from '../markdown';
import MemberProfile from './member-profile';

const StudentGroupView = ({ group }: { group: StudentGroup }): JSX.Element => {
    return (
        <>
            <Markdown options={{ overrides: MapMarkdownChakra }}>{group.info}</Markdown>
            <Divider my="5" />
            <Wrap spacing={['1em', null, '2.5em']} justify="center">
                {group.roles.map((role: Role) =>
                    role.members.map((profile: Profile) => (
                        <WrapItem key={profile.name}>
                            <MemberProfile profile={profile} role={role.name} />
                        </WrapItem>
                    )),
                )}
            </Wrap>
        </>
    );
};

export default StudentGroupView;
