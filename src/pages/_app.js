// TODO remove global import of all AntD CSS, use modular LESS loading instead.
// See .babelrc options: https://github.com/ant-design/babel-plugin-import#usage
import 'src/styles/antd.css'
import 'src/styles/bootstrap-utilities-4.3.1.css'
import 'src/styles/components.scss'

// Subsocial custom styles:
import 'src/styles/subsocial.scss'
import 'src/styles/subsocial-mobile.scss'

import React from 'react'
import Head from 'next/head'
import { GoogleAnalytics } from 'nextjs-google-analytics'
import NextLayout from '../layout/NextLayout'
import { wrapper } from '../rtk/app/store'
import { gaId } from 'src/config/env'

import '../i18n'
import HeadMeta from 'src/components/utils/HeadMeta'

const App = (props) => {
  const { Component, pageProps } = props

  const { head } = pageProps

  return (
    <>
      <Head>
        <script src='/env.js' />
      </Head>
      <HeadMeta {...head} />
      <GoogleAnalytics trackPageViews gaMeasurementId={gaId} />
      <NextLayout>
        <Component {...pageProps} />
      </NextLayout>
    </>
  )
}

export default wrapper.withRedux(App)
