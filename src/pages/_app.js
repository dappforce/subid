// TODO remove global import of all AntD CSS, use modular LESS loading instead.
// See .babelrc options: https://github.com/ant-design/babel-plugin-import#usage
import 'src/styles/antd.css'
import 'src/styles/bootstrap-utilities-4.3.1.css'
import 'src/styles/components.scss'

// Subsocial custom styles:
import 'src/styles/subsocial.scss'
import 'src/styles/subsocial-mobile.scss'

import React, { useEffect } from 'react'
import Head from 'next/head'
import { GoogleAnalytics } from 'nextjs-google-analytics'
import NextLayout from '../layout/NextLayout'
import { wrapper } from '../rtk/app/store'
import { gaId } from 'src/config/env'

import '../i18n'
import HeadMeta from 'src/components/utils/HeadMeta'
import { useSendEvent } from '@/components/providers/AnalyticContext'
import { useRouter } from 'next/router'
import { getLocalStorageData } from 'src/components/utils'

const App = (props) => {
  const { Component, pageProps } = props
  const sendEvent = useSendEvent()
  const router = useRouter()
  const { pathname } = router

  useEffect(() => {
    sendEvent('app_loaded', { pathname }, { ...getLocalStorageData() })
  }, [])

  const { head } = pageProps

  return (
    <>
      <HeadMeta {...head} />
      <GoogleAnalytics trackPageViews gaMeasurementId={gaId} />
      <NextLayout>
        <Component {...pageProps} />
      </NextLayout>
    </>
  )
}

export default wrapper.withRedux(App)
