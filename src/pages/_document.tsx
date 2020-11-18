import { ColorModeScript } from '@chakra-ui/react';
import Document, { Html, Head, Main, NextScript, DocumentInitialProps, DocumentContext } from 'next/document';
import React from 'react';

const getInitialProps = async (ctx: DocumentContext): Promise<DocumentInitialProps> => {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
};

const CustomDocument = (): JSX.Element => {
    return (
        <Html lang="nb-NO">
            <Head>{/* <link rel="icon" type="image/png" href="/icon.png" /> */}</Head>
            <body>
                <ColorModeScript initialColorMode="light" />
                <Main />
                <NextScript />
            </body>
        </Html>
    );
};

CustomDocument.getInitialProps = getInitialProps;
CustomDocument.renderDocument = Document.renderDocument;

export default CustomDocument;
