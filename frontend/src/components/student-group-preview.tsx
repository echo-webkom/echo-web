import { StudentGroup } from '@api/student-group';
import { Box, Text, Flex, useColorModeValue } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useState } from 'react';

interface Props {
    studentGroups: Array<StudentGroup>;
}

const StudentGroupPreview = ({ studentGroups }: Props): JSX.Element => {
    return (
        <>
            {studentGroups.map((group) => {
                const [hover, setHover] = useState(false);

                const bg = useColorModeValue('gray.200', 'gray.800');

                return (
                    <NextLink href={'/for-studenter/studentgrupper/' + group.slug}>
                        <Box
                            {...{ bg }}
                            borderRadius="md"
                            overflow="hidden"
                            cursor="pointer"
                            onMouseOver={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}
                            bgImage={group.imageUrl ?? ''}
                            bgPosition="center"
                            bgSize="cover"
                            bgRepeat="no-repeat"
                            h="225px"
                        >
                            <Flex
                                boxSize="full"
                                backdropFilter="auto"
                                backdropBlur={hover ? '0' : '5px'}
                                transition="0.2s ease-in-out"
                                justify="center"
                                alignItems="center"
                            >
                                <Text
                                    fontWeight="bold"
                                    textColor="white"
                                    transition="0.2s ease-in-out"
                                    fontSize={hover ? '3xl' : '2xl'}
                                >
                                    {group.name}
                                </Text>
                            </Flex>
                        </Box>
                    </NextLink>
                );
            })}
        </>
    );
};

export default StudentGroupPreview;
