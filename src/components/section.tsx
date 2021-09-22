/* eslint-disable react/jsx-props-no-spreading */
import { Box, BoxProps, useColorModeValue } from '@chakra-ui/react';
import React from 'react';

const Section = (props: BoxProps): JSX.Element => {
    const bg = useColorModeValue('bg.light.secondary', 'bg.dark.secondary');
    return <Box bg={bg} p="6" overflow="hidden" shadow="lg" {...props} />;
};

export default Section;
