import React from 'react';

import Markdown from 'markdown-to-jsx';
import Layout from '../components/layout';
import SEO from '../components/seo';
import undergrupper from '../../public/static/for-studenter/undergrupper.md';
import underorganisasjoner from '../../public/static/for-studenter/underorganisasjoner.md';
import masterinfo from '../../public/static/for-studenter/masterinfo.md';
import StaticInfo from '../components/static-info';
import MapMarkdownChakra from '../markdown';

const ForStudenterPage = (): JSX.Element => {
    return (
        <Layout>
            <SEO title="For studenter" />
            <StaticInfo
                tabNames={['Undergrupper', 'Underorganisasjoner', 'Masterinfo']}
                tabPanels={[
                    <Markdown options={MapMarkdownChakra}>{undergrupper}</Markdown>,
                    <Markdown options={MapMarkdownChakra}>{underorganisasjoner}</Markdown>,
                    <Markdown options={MapMarkdownChakra}>{masterinfo}</Markdown>,
                ]}
            />
        </Layout>
    );
};

export default ForStudenterPage;
