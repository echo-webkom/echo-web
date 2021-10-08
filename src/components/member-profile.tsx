import { Avatar, Box, Center, chakra, Text, useBreakpointValue } from '@chakra-ui/react';
import Image from 'next/image';
import React from 'react';
import { Profile } from '../lib/api/student-group';

const MemberImage = chakra(Image, {
    baseStyle: { maxH: 128, maxW: 128 },
    shouldForwardProp: (prop) => ['width', 'height', 'src', 'alt', 'quality'].includes(prop),
});

const MemberProfile = ({ profile, role }: { profile: Profile; role: string }): JSX.Element => {
    const memberImageSize = useBreakpointValue([96, 96, 128]);

    const getInitials = (name: string) => {
        const words = name.split(' ');
        return words.length >= 2 ? `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}` : words[0].charAt(0);
    };

    return (
        <Box
            p={['0', null, '.5em']}
            w={['120px', null, '200px']}
            overflow="visible"
            textAlign="center"
            fontSize={['.7em', null, '1em']}
        >
            <Center>
                {profile.imageUrl && (
                    <MemberImage
                        width={128}
                        height={128}
                        src={profile.imageUrl}
                        alt={profile.name}
                        quality={100}
                        w={memberImageSize}
                        h={memberImageSize}
                        borderRadius="100%"
                    />
                )}
                {!profile.imageUrl && (
                    <Avatar
                        getInitials={getInitials}
                        size="2xl"
                        name={profile.name}
                        src={profile.imageUrl || undefined}
                        alt="bilde"
                    />
                )}
            </Center>
            <Text my=".5em">{profile.name}</Text>
            <Text as="i">{role}</Text>
        </Box>
    );
};

export default MemberProfile;
