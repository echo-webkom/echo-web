import { Avatar, Flex, Box, Center, Text, useBreakpointValue } from '@chakra-ui/react';
import Image from 'next/image';
import type { Profile } from '@api/profile';
import { imgUrlFor } from '@api/sanity';

const getInitials = (name: string) => {
    const words = name.split(' ');
    return words.length >= 2 ? `${words[0].charAt(0)}${words.at(-1)?.charAt(0) ?? ''}` : words[0].charAt(0);
};

interface Props {
    profile: Profile;
    role: string;
}

const MemberProfile = ({ profile, role }: Props) => {
    const imgSize = useBreakpointValue([96, 96, 128]);

    return (
        <Box p={['0', null, '.5em']} w={['120px', null, '200px']} overflow="visible" textAlign="center">
            <Center>
                {profile.imageUrl && (
                    <Flex borderRadius="100%" overflow="hidden">
                        <Image
                            src={imgUrlFor(profile.imageUrl).width(512).height(512).fit('crop').auto('format').url()}
                            alt={profile.name}
                            width={imgSize ?? 128}
                            height={imgSize ?? 128}
                        />
                    </Flex>
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
