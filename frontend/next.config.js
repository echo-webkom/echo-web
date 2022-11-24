const withPWA = require('next-pwa')({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
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
    async redirects() {
        return [
            { source: '/events', destination: '/event', permanent: true },
            {
                source: '/events/:path',
                destination: '/event/:path',
                permanent: true,
            },
            { source: '/bedpres/:path', destination: '/event/:path', permanent: true },
        ];
    },
    reactStrictMode: true,
});
