import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';

const ContentBox = ({ children, noPadding }: { children: React.ReactNode; noPadding?: boolean }): JSX.Element => {
    const bg = useColorModeValue('white', 'gray.900');
    const padding = noPadding ? 0 : 6;
    return (
        <Box bg={bg} overflow="hidden" p={padding} shadow="lg">
            {children}
        </Box>
    );
};

ContentBox.defaultProps = {
    noPadding: false,
};

export default ContentBox;
