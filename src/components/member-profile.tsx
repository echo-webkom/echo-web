import { Avatar, Box, Center, Text, useBreakpointValue } from '@chakra-ui/react';
import React from 'react';
import { Profile } from '../lib/api/student-group';

const MemberProfile = ({ profile, role }: { profile: Profile; role: string }): JSX.Element => {
    const size = useBreakpointValue(['xl', 'xl', '2xl']);

    const getInitials = (name: string) => {
        const words = name.split(' ');
        return words.length >= 2 ? `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}` : words[0].charAt(0);
    };

    return (
        <Box
            p={['0', null, '.5em']}
            w={['120px', '200px']}
            overflow="hidden"
            textAlign="center"
            fontSize={['.7em', '1em']}
        >
            <Center>
                <Avatar
                    getInitials={getInitials}
                    size={size}
                    name={profile.name}
                    src={profile.pictureUrl || undefined}
                    alt="bilde"
                />
            </Center>
            <Text my=".5em">{profile.name}</Text>
            <Text as="i">{role}</Text>
        </Box>
    );
};

export default MemberProfile;
