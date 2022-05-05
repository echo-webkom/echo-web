import { Avatar, Box, Center, chakra, Text, useBreakpointValue } from '@chakra-ui/react';
import Image from 'next/image';
import React from 'react';
import { Profile } from '../lib/api';

const MemberImage = chakra(Image, {
    baseStyle: { maxH: 128, maxW: 128 },
    shouldForwardProp: (prop) => ['width', 'height', 'src', 'alt', 'quality'].includes(prop),
});

const getInitials = (name: string) => {
    const words = name.split(' ');
    return words.length >= 2 ? `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}` : words[0].charAt(0);
};

interface Props {
    profile: Profile;
    role: string;
}

const MemberProfile = ({ profile, role }: Props): JSX.Element => {
    const memberImageSize = useBreakpointValue([96, 96, 128]);

    return (
        <Box p={['0', null, '.5em']} w={['120px', null, '200px']} overflow="visible" textAlign="center">
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
                    <Avatar getInitials={getInitials} size="2xl" name={profile.name} src={undefined} />
                )}
            </Center>
            <Text my=".5em">{profile.name}</Text>
            <Text as="i">{role}</Text>
        </Box>
    );
};

export default MemberProfile;
