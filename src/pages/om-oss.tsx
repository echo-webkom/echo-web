import React from 'react';

import Layout from '../components/layout';
import SEO from '../components/seo';
import hvemErVi from '../../public/static/om-oss/hvem-er-vi.md';
import instituttraadet from '../../public/static/om-oss/instituttraadet.md';
import statutter from '../../public/static/om-oss/statutter.md';
import StaticInfo from '../components/static-info';

const OmOssPage = (): JSX.Element => {
    return (
        <Layout>
            <SEO title="Om echo" />
            <StaticInfo
                tabNames={['Hvem er vi?', 'Instituttrådet', 'Statutter']}
                markdownFiles={[hvemErVi, instituttraadet, statutter]}
            />
        </Layout>
    );
};

export default OmOssPage;
