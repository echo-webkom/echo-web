import type { BoxProps } from '@chakra-ui/react';
import { Box, useColorModeValue } from '@chakra-ui/react';

const Section = (props: BoxProps) => {
    const bg = useColorModeValue('bg.light.secondary', 'bg.dark.secondary');
    return (
        <Box bg={bg} p="6" shadow="lg" borderRadius="0.5rem" boxShadow="0 10px 20px 0 rgba(0, 0, 0, 0.1)" {...props} />
    );
};

export default Section;
