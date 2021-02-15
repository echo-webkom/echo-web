import Markdown from 'markdown-to-jsx';
import React from 'react';

import md from '../../../public/static/underorganisasjoner.md';
import Layout from '../../components/layout';
import MapMarkdownChakra from '../../markdown';

const UnderOrganisasjoner = (): JSX.Element => {
    return (
        <Layout>
            <Markdown options={MapMarkdownChakra}>{md}</Markdown>
        </Layout>
    );
};

export default UnderOrganisasjoner;
