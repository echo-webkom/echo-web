/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Box, BoxProps, useColorModeValue } from '@chakra-ui/react';

const ContentBox = (props: BoxProps): JSX.Element => {
    const bg = useColorModeValue('bg2Light', 'bg2Dark');
    return <Box bg={bg} p="6" overflow="hidden" shadow="lg" {...props} />;
};

export default ContentBox;
