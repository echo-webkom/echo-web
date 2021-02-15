import Markdown from 'markdown-to-jsx';
import React from 'react';

import md from '../../../public/static/forBedrifter.md';
import Layout from '../../components/layout';
import MapMarkdownChakra from '../../markdown';

const ForBedrifter = (): JSX.Element => {
    return (
        <Layout>
            <Markdown options={MapMarkdownChakra}>{md}</Markdown>
        </Layout>
    );
};

export default ForBedrifter;
