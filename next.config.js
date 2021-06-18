module.exports = {
    webpack: (config) => {
        config.module.rules.push({
            test: /\.md$/,
            type: 'asset/source',
        });
        return config;
    },
    images: {
        domains: ['images.ctfassets.net'],
    },

    reactStrictMode: true,
};
