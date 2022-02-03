import Markdown from 'markdown-to-jsx';
import React from 'react';
import bedriftspresentasjon from '../../public/static/for-bedrifter/bedriftspresentasjon.md';
import forBedrifter from '../../public/static/for-bedrifter/for-bedrifter.md';
import stillingsutlysninger from '../../public/static/for-bedrifter/stillingsutlysninger.md';
import SEO from '../components/seo';
import InfoPanels from '../components/info-panels';
import MapMarkdownChakra from '../markdown';

const ForBedrifterPage = (): JSX.Element => {
    return (
        <>
            <SEO title="For bedrifter" />
            <InfoPanels
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
        </>
    );
};

export default ForBedrifterPage;
