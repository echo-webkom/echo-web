import React from 'react';
import PropTypes from 'prop-types';

import Header from './header';
import Footer from './footer';

interface Props {
    children: React.ReactNode;
}

const Layout = ({ children }: Props): JSX.Element => {
    return (
        <>
            <Header />
            {children}
            <Footer />
        </>
    );
};

Layout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Layout;
