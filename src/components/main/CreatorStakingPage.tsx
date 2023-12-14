/* eslint-disable react/no-unknown-property */
import Head from 'next/head'
import { PageContent } from '../utils/PageWrapper'
import Footer from '../footer/Footer'
import styles from './Main.module.sass'
import CreatorsStaking from '../creatorsStaking'
import clsx from 'clsx'
import { NextPage } from 'next'

type CreatorStakingPageProp = {
  spaceId?: string 
  domain?: string
}

const CreatorStakingPage: NextPage<CreatorStakingPageProp> = (props) => {
  console.log(props)

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
          <CreatorsStaking defaultSpaceId={props.spaceId} />
        </PageContent>
      </div>
      <Footer />
    </>
  )
}

export default CreatorStakingPage
