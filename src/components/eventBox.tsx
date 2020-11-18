import React from 'react';

import { Grid } from '@chakra-ui/react';
import Event from './event';

const logo = '/consulting.png';

const EventBox = (): JSX.Element => {
    return (
        <Grid templateColumns="repeat(3, 1fr)" gap={6}>
            <Event imageSrc={logo} imageAlt="logo" />
            <Event imageSrc={logo} imageAlt="logo" />
            <Event imageSrc={logo} imageAlt="logo" />
        </Grid>
    );
};

export default EventBox;
