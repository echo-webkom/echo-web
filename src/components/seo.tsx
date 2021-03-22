import React from 'react';
import Head from 'next/head';
import config from '../config';

interface Props {
    description?: string;
    title?: string;
}

const SEO = ({ description, title }: Props): JSX.Element => {
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

            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
            <link rel="manifest" href="/site.webmanifest" />
            <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
            <meta name="msapplication-TileColor" content="#603cba" />
            <meta name="theme-color" content="#ffffff" />
        </Head>
    );
};

SEO.defaultProps = {
    description: config.description,
    title: config.title,
};

export default SEO;
