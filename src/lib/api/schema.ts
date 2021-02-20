const GET_EVENT_PATHS = `
    query {
        eventCollection(limit: 10) {
            items {
                slug
            }
        }
    }
`;

const GET_N_EVENTS = `
    query ($n: Int!) {
        eventCollection(limit: $n) {
            items {
                title
                slug
                date
                spots
                body
                image {
                    url
                }
                location
                sys {
                    firstPublishedAt
                }
                author {
                    authorName
                }
            }
        }
    }
`;

const GET_EVENT_BY_SLUG = `
    query ($slug: String!) {
        eventCollection(where: { slug: $slug }) {
            items {
                title
                slug
                date
                spots
                body
                image {
                    url
                }
                location
                sys {
                    firstPublishedAt
                }
                author {
                    authorName
                }
            }
        }
    }
`;

const GET_POST_PATHS = `
    query {
        postCollection(limit: 10) {
            items {
                slug
            }
        }
    }
`;

const GET_N_POSTS = `
    query ($n: Int!) {
        postCollection(limit: $n) {
            items {
                title
                slug
                body
                author {
                    authorName
                }
                sys {
                    firstPublishedAt
                }
            }
        }
    }
`;

const GET_POST_BY_SLUG = `
    query ($slug: String!) {
        postCollection(where: { slug: $slug }) {
            items {
                title
                slug
                body
                author {
                    authorName
                }
                sys {
                    firstPublishedAt
                }
            }
        }
    }
`;

export { GET_EVENT_PATHS, GET_N_EVENTS, GET_EVENT_BY_SLUG, GET_POST_PATHS, GET_N_POSTS, GET_POST_BY_SLUG };
