import React from 'react';
import { graphql } from 'gatsby';
import { Box } from '@chakra-ui/react';
import Markdown from 'markdown-to-jsx';
import MapMarkdownChakra from '../markdown';

import Layout from '../components/layout';
import SEO from '../components/seo';

interface Props {
    data: {
        contentfulPost: {
            title: string;
            body: {
                body: string;
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
            body: { body },
        },
    },
}: Props): JSX.Element => {
    return (
        <Layout>
            <SEO title={title} />
            <Box ml="5em" mr="5em" mb="300px">
                <Markdown options={MapMarkdownChakra}>{body}</Markdown>
            </Box>
        </Layout>
    );
};

export const query = graphql`
    query PostBySlug($slug: String!) {
        contentfulPost(slug: { eq: $slug }) {
            title
            body {
                body
            }
        }
    }
`;

export default BlogPostTemplate;
