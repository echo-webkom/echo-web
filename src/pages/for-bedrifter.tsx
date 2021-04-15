import React from 'react';

import Markdown from 'markdown-to-jsx';
import Layout from '../components/layout';
import SEO from '../components/seo';
import forBedrifter from '../../public/static/for-bedrifter/for-bedrifter.md';
import bedriftspresentasjon from '../../public/static/for-bedrifter/bedriftspresentasjon.md';
import stillingsutlysninger from '../../public/static/for-bedrifter/stillingsutlysninger.md';
import StaticInfo from '../components/static-info';
import MapMarkdownChakra from '../markdown';

const ForBedrifterPage = (): JSX.Element => {
    return (
        <Layout>
            <SEO title="For bedrifter" />
            <StaticInfo
                tabNames={['For bedrifter', 'Bedriftspresentasjon', 'Stillingsutlysninger']}
                tabPanels={[
                    <Markdown options={MapMarkdownChakra}>{forBedrifter}</Markdown>,
                    <Markdown options={MapMarkdownChakra}>{bedriftspresentasjon}</Markdown>,
                    <Markdown options={MapMarkdownChakra}>{stillingsutlysninger}</Markdown>,
                ]}
            />
        </Layout>
    );
};

export default ForBedrifterPage;
