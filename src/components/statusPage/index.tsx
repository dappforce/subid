import React from 'react'
import { PageContent } from '../utils/PageWrapper'
import StatusCard from './utils/StatusCard'
import dynamic from 'next/dynamic'

const Footer = dynamic(() => import('../footer/Footer'), { ssr: false })

const StatusPage = () => {

  return <>
    <div className='layout-wrapper'>
      <PageContent
        meta={{
          title: 'Status Page'
        }}
      >
        <StatusCard />
      </PageContent>
    </div>
    <Footer />
  </>
}

export default StatusPage
