/* eslint-disable @typescript-eslint/no-var-requires */
const withBundleAnalyzer = require('@next/bundle-analyzer')

// Required by Docker
require('dotenv').config()

const nextConfig = {
  target: 'server',
  staticPageGenerationTimeout: 1000,
  api: {
    responseLimit: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false
    }

    config.plugins = config.plugins || []

    config.plugins = [
      ...config.plugins,
    ]

    config.module.rules.push(
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: ['@svgr/webpack'],
      },
      {
        test: /\.(raw)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'raw-loader',
      },
      {
        test: /\.md$/,
        use: ['html-loader', 'markdown-loader'],
      },
    )

    return config
  },
}

let config = nextConfig
if (process.env.ANALYZE) {
  config = withBundleAnalyzer(nextConfig)
}

module.exports = config
