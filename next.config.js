const withPWA = require('next-pwa');

module.exports = withPWA({
    pwa: {
        dest: 'public',
    },
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
    async redirects() {
        return [
            { source: '/events', destination: '/event', permanent: true },
            {
                source: '/events/:path',
                destination: '/event/:path',
                permanent: true,
            },
        ];
    },
    reactStrictMode: true,
});
