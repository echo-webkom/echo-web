import React from 'react';
import PropTypes from 'prop-types';

interface Props {
    children: React.ReactNode;
}

const Layout = ({ children }: Props): JSX.Element => {
    return (
        <>
            <p>echo - Fagutvalget for informatikk</p>
            {children}
        </>
    );
};

Layout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Layout;
