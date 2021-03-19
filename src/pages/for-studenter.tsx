import React from 'react';

import Layout from '../components/layout';
import SEO from '../components/seo';
import undergrupper from '../../public/static/for-studenter/undergrupper.md';
import underorganisasjoner from '../../public/static/for-studenter/underorganisasjoner.md';
import masterinfo from '../../public/static/for-studenter/masterinfo.md';
import StaticInfo from '../components/static-info';

const ForStudenterPage = (): JSX.Element => {
    return (
        <Layout>
            <SEO title="For studenter" />
            <StaticInfo
                tabNames={['Undergrupper', 'Underorganisasjoner', 'Masterinfo']}
                markdownFiles={[undergrupper, underorganisasjoner, masterinfo]}
            />
        </Layout>
    );
};

export default ForStudenterPage;
