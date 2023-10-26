import React from 'react'
import { PageContent } from '../utils/PageWrapper'
import StatusCard from './utils/StatusCards'
import dynamic from 'next/dynamic'

const Footer = dynamic(() => import('../footer/Footer'), { ssr: false })

const StatusPage = () => {

  return <>
    <div className='layout-wrapper'>
      <PageContent>
        <StatusCard />
      </PageContent>
    </div>
    <Footer />
  </>
}

export default StatusPage
