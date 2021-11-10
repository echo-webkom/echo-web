module.exports = {
    webpack: (config) => {
        config.module.rules.push({
            test: /\.md$/,
            type: 'asset/source',
        });
        return config;
    },
    images: {
        domains: ['cdn.sanity.io'],
    },
    experimental: {
        esmExternals: false,
    },

    reactStrictMode: true,
};
