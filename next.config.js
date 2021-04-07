module.exports = {
    webpack: (config) => {
        config.module.rules.push({
            test: /\.md$/,
            use: 'raw-loader',
            type: 'javascript/auto',
        });
        return config;
    },
    images: {
        domains: ['images.ctfassets.net'],
    },
    future: {
        webpack5: true,
    },

    reactStrictMode: true,
};
