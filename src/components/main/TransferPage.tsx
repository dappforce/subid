import React from 'react'
import { NextPage } from 'next'
import TransferPageLayout from '../transfer/TransferPageLayout'
import { PageContent } from '../utils/PageWrapper'
import clsx from 'clsx'
import Footer from '../footer/Footer'
import styles from './Main.module.sass'

type TransferPageProps = {
  transferType?: string
  asset?: string
  from?: string
  to?: string
}

const TransferPage: NextPage<TransferPageProps> = (props) => {
  const { transferType, asset, from, to } = props

  return (
    <>
      <div className={clsx('layout-wrapper', styles.TransferPage)}>
        <PageContent>
          <TransferPageLayout
            transferType={
              transferType === 'cross' ? 'cross-chain' : 'same-chain'
            }
            defaultSelectedToken={{ token: asset || 'DOT', network: from }}
            to={to}
          />
        </PageContent>
      </div>
      <Footer />
    </>
  )
}

export default TransferPage
