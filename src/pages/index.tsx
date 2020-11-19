import React from 'react';

import Layout from '../components/layout';
import SEO from '../components/seo';
import Events from '../components/events';

const IndexPage = (): JSX.Element => (
    <Layout>
        <SEO title="Home" />
        <Events />
    </Layout>
);

export default IndexPage;
