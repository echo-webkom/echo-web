import React from 'react';
import { Helmet } from 'react-helmet';
import { useStaticQuery, graphql } from 'gatsby';

interface Props {
    description?: string;
    title?: string;
}

function SEO({ description, title }: Props): JSX.Element {
    const { site } = useStaticQuery(
        graphql`
            query {
                site {
                    siteMetadata {
                        title
                        description
                        author
                    }
                }
            }
        `,
    );

    const metaDescription = description || site.siteMetadata.description;

    return (
        <Helmet
            htmlAttributes={{
                lang: 'no',
            }}
            title={title}
            titleTemplate={`%s | ${site.title}`}
            defaultTitle="echo - Fagutvalget for informatikk"
            meta={[
                {
                    name: `description`,
                    content: metaDescription,
                },
                {
                    property: `og:title`,
                    content: title,
                },
                {
                    property: `og:description`,
                    content: metaDescription,
                },
                {
                    property: `og:type`,
                    content: `website`,
                },
            ]}
        />
    );
}

SEO.defaultProps = {
    description: 'echo - Fagutvalget for informatikk',
    title: 'echo - Fagutvalget for informatikk',
};

export default SEO;
