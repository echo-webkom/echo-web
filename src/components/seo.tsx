import Head from 'next/head';
import React from 'react';
import { useColorModeValue } from '@chakra-ui/react';

interface Props {
    description?: string;
    title: string;
}

const SEO = ({ description = 'Nettsiden til echo – Fagutvalget for informatikk.', title }: Props): JSX.Element => {
    const themeColor = useColorModeValue('bg.light.primary', 'bg.dark.primary');
    return (
        <Head>
            <title>{title}</title>

            <meta name="robots" content="follow, index" />
            <meta name="description" content={description} />
            <meta name="msapplication-TileColor" content="#603cba" />
            <meta name="theme-color" content={themeColor} />
            <meta property="og:type" content="website" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:site_name" content={title} />

            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
            <link rel="manifest" href="/site.webmanifest" />
            <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        </Head>
    );
};

export default SEO;
