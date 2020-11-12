import React from 'react';
import { graphql } from 'gatsby';

import Layout from '../components/layout';
import SEO from '../components/seo';

interface Props {
    data: {
        contentfulPost: {
            title: string;
            body: {
                childMarkdownRemark: {
                    html: string;
                };
            };
        };
    };
}

const BlogPostTemplate = ({
    data: {
        contentfulPost: {
            title,
            body: {
                childMarkdownRemark: { html },
            },
        },
    },
}: Props): JSX.Element => {
    return (
        <Layout>
            <SEO title={title} />
            <div>
                <div dangerouslySetInnerHTML={{ __html: html }} />
            </div>
        </Layout>
    );
};

export const query = graphql`
    query PostBySlug($slug: String!) {
        contentfulPost(slug: { eq: $slug }) {
            title
            body {
                childMarkdownRemark {
                    html
                }
            }
        }
    }
`;

export default BlogPostTemplate;
