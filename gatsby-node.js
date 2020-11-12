const Promise = require('bluebird');
const path = require('path');

exports.createPages = ({ graphql, actions }) => {
    const { createPage } = actions;

    return new Promise((resolve, reject) => {
        const postTemplate = path.resolve('./src/templates/blogPost.tsx');

        resolve(
            graphql(
                `
                    {
                        allContentfulPost {
                            edges {
                                node {
                                    slug
                                }
                            }
                        }
                    }
                `,
            ).then((result) => {
                if (result.errors) {
                    console.log(result.errors);
                    reject(result.errors);
                }

                const posts = result.data.allContentfulPost.edges;
                posts.forEach((post) => {
                    createPage({
                        path: `/post/${post.node.slug}`,
                        component: postTemplate,
                        context: {
                            slug: post.node.slug,
                        },
                    });
                });
            }),
        );
    });
};
