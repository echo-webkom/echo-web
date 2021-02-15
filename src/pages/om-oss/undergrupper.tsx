import Markdown from 'markdown-to-jsx';
import React from 'react';

import md from '../../../public/static/undergrupper.md';
import Layout from '../../components/layout';
import MapMarkdownChakra from '../../markdown';

const UnderGrupper = (): JSX.Element => {
    return (
        <Layout>
            <Markdown options={MapMarkdownChakra}>{md}</Markdown>
        </Layout>
    );
};

export default UnderGrupper;
