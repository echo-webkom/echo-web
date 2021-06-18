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
                    <Markdown key="forBedrifter" options={{ overrides: MapMarkdownChakra }}>
                        {forBedrifter}
                    </Markdown>,
                    <Markdown key="bedriftspresentasjon" options={{ overrides: MapMarkdownChakra }}>
                        {bedriftspresentasjon}
                    </Markdown>,
                    <Markdown key="stillingsutlysninger" options={{ overrides: MapMarkdownChakra }}>
                        {stillingsutlysninger}
                    </Markdown>,
                ]}
            />
        </Layout>
    );
};

export default ForBedrifterPage;
