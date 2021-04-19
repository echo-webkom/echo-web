import { Avatar, Box, Center, Text, useBreakpointValue } from '@chakra-ui/react';
import React from 'react';
import { Profile } from '../lib/types';

const MemberProfile = ({ profile, role }: { profile: Profile; role: string }): JSX.Element => {
    const size = useBreakpointValue(['xl', 'xl', '2xl']);

    return (
        <Box
            p={['0', null, '.5em']}
            w={['120px', '200px']}
            overflow="hidden"
            textAlign="center"
            fontSize={['.7em', '1em']}
        >
            <Center>
                <Avatar size={size} name={profile.name} src={profile.imageUrl || undefined} alt="bilde" />
            </Center>
            <Text my=".5em">{profile.name}</Text>
            <Text as="i">{role}</Text>
        </Box>
    );
};

export default MemberProfile;
