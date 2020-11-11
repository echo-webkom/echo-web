import React from 'react';

import Layout from '../components/layout';
import SEO from '../components/seo';
import EventBox from '../components/eventBox';

const IndexPage = (): JSX.Element => (
    <Layout>
        <SEO title="Home" />
        <EventBox />
    </Layout>
);

export default IndexPage;
