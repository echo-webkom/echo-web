import React from 'react';
import Head from 'next/head';
import config from '../config';

interface Props {
    description?: string;
    title?: string;
}

function SEO({ description, title }: Props): JSX.Element {
    const metaDescription = description || config.description;
    const defaultTitle = config.title;

    return (
        <Head>
            <title>{`${title} | ${defaultTitle}`}</title>
            <meta name="robots" content="follow, index" />
            <meta content={metaDescription} name="description" />
            <meta property="og:type" content="website" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:site_name" content={defaultTitle} />
        </Head>
    );
}

SEO.defaultProps = {
    description: config.description,
    title: config.title,
};

export default SEO;
