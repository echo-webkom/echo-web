import sanityClient from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const SanityAPI = sanityClient({
    projectId: 'pgq2pd26',
    dataset: process.env.SANITY_DATASET ?? 'production',
    apiVersion: '2021-04-10',
    useCdn: true,
});

const builder = imageUrlBuilder(SanityAPI);

const imgUrlFor = (source: any) => {
    return builder.image(source);
};

export default SanityAPI;
export { imgUrlFor };
