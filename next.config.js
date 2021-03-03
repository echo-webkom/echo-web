module.exports = {
    webpack: function (config) {
        config.module.rules.push({
            test: /\.md$/,
            use: 'raw-loader',
            type: 'javascript/auto',
        });
        return config;
    },
};
