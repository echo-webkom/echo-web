import { Divider, Wrap, WrapItem } from '@chakra-ui/react';
import Markdown from 'markdown-to-jsx';
import React from 'react';
import { Member, StudentGroup } from '../lib/api';
import MapMarkdownChakra from '../markdown';
import MemberProfile from './member-profile';

const StudentGroupView = ({ group }: { group: StudentGroup }): JSX.Element => {
    return (
        <>
            <Markdown options={{ overrides: MapMarkdownChakra }}>{group.info}</Markdown>
            <Divider my="5" />
            <Wrap spacing={['1em', null, '2.5em']} justify="center">
                {group.members.map((member: Member) => (
                    <WrapItem key={member.profile.name}>
                        <MemberProfile profile={member.profile} role={member.role} />
                    </WrapItem>
                ))}
            </Wrap>
        </>
    );
};

export default StudentGroupView;
