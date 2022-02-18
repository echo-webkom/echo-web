import Head from 'next/head';
import React from 'react';

interface Props {
    description?: string;
    title: string;
}

const SEO = ({ description = 'Nettsiden til echo – Fagutvalget for informatikk.', title }: Props): JSX.Element => {
    return (
        <Head>
            <title>{title}</title>

            <meta name="description" content={description} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:site_name" content={title} />
            <meta name="apple-mobile-web-app-capable" content="yes" />
        </Head>
    );
};

export default SEO;
