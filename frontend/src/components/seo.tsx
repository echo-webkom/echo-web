import Head from 'next/head';

interface Props {
    description?: string;
    title: string;
    image?: string;
}

const SEO = ({
    description = 'Nettsiden til echo – Linjeforeningen for informatikk.',
    title,
    image = '/maskable-icon-192x192.png',
}: Props) => {
    return (
        <Head>
            <title>{title}</title>

            <meta name="description" content={description} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:site_name" content={title} />
            {image && <meta property="og:image" content={image} />}
        </Head>
    );
};

export default SEO;
