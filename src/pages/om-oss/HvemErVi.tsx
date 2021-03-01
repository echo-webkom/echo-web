import React from 'react';
import Markdown from 'markdown-to-jsx';
import MapMarkdownChakra from '../../markdown';
import Layout from '../../components/layout';

import md from '../../../public/static/Hvem-er-vi.md';

const HvemErVi = (): JSX.Element => {
    return (
        <Layout>
            <Markdown options={MapMarkdownChakra}>{md}</Markdown>
        </Layout>
    );
};

export default HvemErVi;
