import sanityClient from '@sanity/client';

const SanityAPI = sanityClient({
    projectId: 'pgq2pd26',
    dataset: process.env.SANITY_DATASET ?? 'production',
    apiVersion: '2021-04-10',
    useCdn: true,
});

export default SanityAPI;
