import React from 'react';

import { Box, Image } from '@chakra-ui/core';

interface Props {
    imageSrc: string;
    imageAlt: string;
}

const Event = ({ imageSrc, imageAlt }: Props): JSX.Element => {
    return (
        <Box>
            <h1>Generisk Konsulentselskap AS</h1>
            <Image size="200px" src={imageSrc} alt={imageAlt} />
        </Box>
    );
};

export default Event;
