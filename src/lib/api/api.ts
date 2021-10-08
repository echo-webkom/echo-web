import sanityClient from '@sanity/client';

export const SanityAPI = sanityClient({
    projectId: 'pgq2pd26',
    dataset: 'production',
    apiVersion: '2021-04-10',
    token: process.env.SANITY_TOKEN,
    useCdn: true,
});
