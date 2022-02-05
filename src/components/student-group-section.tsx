import {
    Center,
    Divider,
    Heading,
    LinkBox,
    LinkOverlay,
    Text,
    useColorModeValue,
    Wrap,
    WrapItem,
} from '@chakra-ui/react';
import React from 'react';
import NextLink from 'next/link';
import { StudentGroup } from '../lib/api';
import ErrorBox from './error-box';

interface Props {
    studentGroups: Array<StudentGroup> | null;
    groupDefinition: string;
    error: string | null;
    groupType: string;
}

const StudentGroupSection = ({ studentGroups, groupDefinition, error, groupType }: Props): JSX.Element => {
    const borderColor = useColorModeValue('bg.light.border', 'bg.dark.border');
    const bgColor = useColorModeValue('bg.light.tertiary', 'bg.dark.tertiary');

    return (
        <>
            {error && <ErrorBox error={error} />}
            {studentGroups && studentGroups.length === 0 && !error && <Text>{`Finner ingen ${groupType} :(`}</Text>}
            {studentGroups && studentGroups.length > 0 && !error && (
                <>
                    <Heading textAlign="center" sizes={['lg', null, null, 'xl']}>
                        {[...groupType.charAt(0).toUpperCase(), ...groupType.slice(1)]}
                    </Heading>
                    <WrapItem margin="10px">
                        <Text align="center">{groupDefinition}</Text>
                    </WrapItem>
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
