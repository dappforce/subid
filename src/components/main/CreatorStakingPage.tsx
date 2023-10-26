/* eslint-disable react/no-unknown-property */
import Head from 'next/head'
import { PageContent } from '../utils/PageWrapper'
import Footer from '../footer/Footer'
import styles from './Main.module.sass'
import CreatorsStaking from '../creatorsStaking'
import clsx from 'clsx'

const CreatorStakingPage = () => {
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
