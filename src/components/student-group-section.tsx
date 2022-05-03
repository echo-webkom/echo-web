import {
    Center,
    Divider,
    Heading,
    LinkBox,
    LinkOverlay,
    Text,
    useBreakpointValue,
    useColorModeValue,
    Wrap,
    WrapItem,
} from '@chakra-ui/react';
import React from 'react';
import NextLink from 'next/link';
import { StudentGroup } from '../lib/api';

interface Props {
    studentGroups: Array<StudentGroup>;
    groupDefinition?: string;
    groupType: string;
}

const StudentGroupSection = ({ studentGroups, groupDefinition, groupType }: Props): JSX.Element => {
    const borderColor = useColorModeValue('bg.light.border', 'bg.dark.border');
    const bgColor = useColorModeValue('bg.light.tertiary', 'bg.dark.tertiary');
    const headingSize = useBreakpointValue(['lg', 'xl', 'xl', 'xl']);

    return (
        <>
            {studentGroups.length === 0 && <Text>{`Finner ingen ${groupType} :(`}</Text>}
            {studentGroups.length > 0 && (
                <>
                    <Heading textAlign="center" size={headingSize}>
                        {[...groupType.charAt(0).toUpperCase(), ...groupType.slice(1)]}
                    </Heading>
                    <Text align="center">{groupDefinition}</Text>
                    <Divider my="1rem" />
                    <Center data-testid="student-group-section">
                        <Wrap spacing="1rem" justify="center" align="center">
                            {studentGroups.map((group: StudentGroup) => (
                                <WrapItem key={group.name}>
                                    <LinkBox
                                        w={['20rem', null, '25rem']}
                                        p={['1rem', '1.5rem', '2rem']}
                                        bg={bgColor}
                                        border="2px"
                                        borderColor="transparent"
                                        borderRadius="0.5rem"
                                        _hover={{ borderColor: borderColor }}
                                        data-testid={group.name}
                                        textAlign="center"
                                    >
                                        <NextLink href={`/for-studenter/${group.slug}`} passHref>
                                            <LinkOverlay>
                                                <Center>
                                                    <Heading size="md">{group.name}</Heading>
                                                </Center>
                                            </LinkOverlay>
                                        </NextLink>
                                    </LinkBox>
                                </WrapItem>
                            ))}
                        </Wrap>
                    </Center>
                </>
            )}
        </>
    );
};

export default StudentGroupSection;
