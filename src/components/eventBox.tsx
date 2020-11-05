import React from 'react';

import { Box, Grid } from '@chakra-ui/core';

import Event from './event';
import logo from '../assets/consulting.jpg';

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
