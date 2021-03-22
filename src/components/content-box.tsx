import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';

const ContentBox = ({
    children,
    noPadding,
    testid,
}: {
    children: React.ReactNode;
    noPadding?: boolean;
    testid?: string;
}): JSX.Element => {
    const padding = noPadding ? 0 : 6;
    const bg = useColorModeValue('bg2Light', 'bg2Dark');
    return (
        <Box bg={bg} overflow="hidden" p={padding} shadow="lg" data-testid={testid}>
            {children}
        </Box>
    );
};

ContentBox.defaultProps = {
    noPadding: false,
    testid: null,
};

export default ContentBox;
