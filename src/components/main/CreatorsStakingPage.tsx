import Head from 'next/head'
import { PageContent } from '../utils/PageWrapper'
import Footer from '../footer/Footer'
import styles from './Main.module.sass'
import CreatorsStaking from '../creatorsStaking'

const CreatorStakingPage = () => {
  return (
    <>
      <Head>
        <link rel='stylesheet' href='/tailwind.css' />
      </Head>
      
      <div className='layout-wrapper'>
        <PageContent
          meta={{
            title: 'Collator Staking',
          }}
          className='position-relative'
          sectionClassName={styles.CreatorStakingSection}
        >
          <CreatorsStaking />
        </PageContent>
      </div>
      <Footer />
    </>
  )
}

export default CreatorStakingPage
