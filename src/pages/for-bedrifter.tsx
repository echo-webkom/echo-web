import React from 'react';

import Layout from '../components/layout';
import SEO from '../components/seo';
import forBedrifter from '../../public/static/for-bedrifter/for-bedrifter.md';
import bedriftspresentasjon from '../../public/static/for-bedrifter/bedriftspresentasjon.md';
import stillingsutlysninger from '../../public/static/for-bedrifter/stillingsutlysninger.md';
import StaticInfo from '../components/static-info';

const ForBedrifterPage = (): JSX.Element => {
    return (
        <Layout>
            <SEO title="Om Oss" />
            <StaticInfo
                tabNames={['For bedrifter', 'Bedriftspresentasjon', 'Stillingsutlysninger']}
                markdownFiles={[forBedrifter, bedriftspresentasjon, stillingsutlysninger]}
            />
        </Layout>
    );
};

export default ForBedrifterPage;
