/* eslint-disable @typescript-eslint/no-var-requires */
const withBundleAnalyzer = require('@next/bundle-analyzer')
const path = require('path')
const Dotenv = require('dotenv-webpack')

// Required by Docker
require('dotenv').config()

const nextConfig = {
  target: 'server',
  api: {
    responseLimit: false,
  },
  images: {
    domains: ['sub.id', 'localhost'],
  },
  webpack: (config, { isServer }) => {
    // // This code for webpack 4
    // if (!isServer) {
    //   config.node = {
    //     fs: 'empty',
    //   }
    // }

    // This code for webpack 5
    if (!isServer) {
      config.resolve.fallback.fs = false
    }

    config.plugins = config.plugins || []

    config.plugins = [
      ...config.plugins,

      // Read the .env file
      new Dotenv({
        path: path.join(__dirname, '.env'),
        systemvars: true, // Required by Docker
      }),
    ]

    config.module.rules.push(
      {
        test: /\.(raw)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'raw-loader',
      },
      {
        test: /\.md$/,
        use: ['html-loader', 'markdown-loader'],
      },
      {
        test: /\.(png|svg|eot|otf|ttf|woff|woff2|gif)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 8192,
            publicPath: '/_next/static/',
            outputPath: 'static/',
            name: '[name].[ext]',
          },
        },
      }
    )

    return config
  },
}

let config = nextConfig
if (process.env.ANALYZE) {
  config = withBundleAnalyzer(nextConfig)
}

module.exports = config
