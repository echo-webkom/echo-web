module.exports = {
    webpack: (config) => {
        config.module.rules.push({
            test: /\.md$/,
            use: 'raw-loader',
            type: 'javascript/auto',
        });
        return config;
    },

    reactStrictMode: true,
};
