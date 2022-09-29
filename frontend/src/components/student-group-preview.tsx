import { Box, Text, Flex, useColorModeValue } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useState } from 'react';
import type { StudentGroup } from '@api/student-group';

interface Props {
    group: StudentGroup;
}

const StudentGroupPreview = ({ group }: Props): JSX.Element => {
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
                appearance="auto"
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
                        textShadow="0 0 40px #000"
                        transition="0.2s ease-in-out"
                        fontSize={hover ? '1.65rem' : '1.5rem'}
                    >
                        {group.name}
                    </Text>
                </Flex>
            </Box>
        </NextLink>
    );
};

export default StudentGroupPreview;
