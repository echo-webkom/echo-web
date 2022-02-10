import { ColorModeScript, useColorModeValue } from '@chakra-ui/react';
import Document, { DocumentContext, DocumentInitialProps, Head, Html, Main, NextScript } from 'next/document';
import React from 'react';
import theme from '../styles/theme';

const getInitialProps = async (ctx: DocumentContext): Promise<DocumentInitialProps> => {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
};

const CustomDocument = (): JSX.Element => {
    const themeColor = useColorModeValue('bg.light.primary', 'bg.dark.primary');

    return (
        <Html lang="nb-NO">
            <Head>
                <meta name="robots" content="follow, index" />
                <meta name="msapplication-TileColor" content="#603cba" />
                <meta name="theme-color" content={themeColor} />
                <meta property="og:type" content="website" />

                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="manifest" href="/site.webmanifest" />
                <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
            </Head>
            <body>
                <ColorModeScript initialColorMode={theme.config.initialColorMode} />
                <Main />
                <NextScript />
            </body>
        </Html>
    );
};

CustomDocument.getInitialProps = getInitialProps;

export default CustomDocument;
