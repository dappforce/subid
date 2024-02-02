/* eslint-disable react/no-unknown-property */
import Head from 'next/head'
import { PageContent } from '../utils/PageWrapper'
import Footer from '../footer/Footer'
import styles from './Main.module.sass'
import CreatorsStaking from '../creatorsStaking'
import clsx from 'clsx'
import { NextPage } from 'next'
import { useFetchBalanceByNetwork } from '@/rtk/features/balances/balancesHooks'
import { useMyAddress } from '../providers/MyExtensionAccountsContext'

const CreatorStakingPage: NextPage = () => {
  const myAddress = useMyAddress()
  useFetchBalanceByNetwork({ address: myAddress, network: 'subsocial' })

  return (
    <>
      <Head>
        <link rel='stylesheet' href='/tailwind.css' />
      </Head>

      <style jsx global>{`
        svg {
          vertical-align: text-top !important;
        }
      `}</style>

      <div className={clsx('layout-wrapper', styles.CreatorStakingSection)}>
        <PageContent className='position-relative'>
          <CreatorsStaking />
        </PageContent>
      </div>
      <Footer />
    </>
  )
}

export default CreatorStakingPage
