import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID as string;
const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN as string;

const httpLink = createHttpLink({
    fetch,
    uri: `https://graphql.contentful.com/content/v1/spaces/${space}`,
    headers: {
        authorization: `Bearer ${accessToken}`,
        'Content-Language': 'en-US',
    },
});

const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
});

export default client;
