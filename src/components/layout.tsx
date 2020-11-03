import React from 'react';
import PropTypes from 'prop-types';
import { Text } from '@chakra-ui/core';
import Footer from './footer';

interface Props {
    children: React.ReactNode;
}

const Layout = ({ children }: Props): JSX.Element => {
    return (
        <>
            {children}
            <Text>echo – Fagutvalget for informatikk</Text>
            <Footer />
        </>
    );
};

Layout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Layout;
