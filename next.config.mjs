/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin',
                    },
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'require-corp',
                    },
                ],
            },
        ];
    },
    webpack(config) {
        config.resolve.alias.fs = false;
        config.resolve.alias.path = false;
        config.resolve.alias.os = false;
        config.resolve.alias.crypto = false;
        return config;
    },
};

export default nextConfig;
