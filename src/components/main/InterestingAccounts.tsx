import React from 'react'
import { NextPage } from 'next'

import { PageContent } from '../utils/PageWrapper'
import { AccountCardType } from '../interesting-accounts/types'
import dynamic from 'next/dynamic'

const AccountsLayout = dynamic(() => import('../interesting-accounts/AccountsLayout'), { ssr: false })
const Footer = dynamic(() => import('../footer/Footer'), { ssr: false })

export type InterestingAccountsPageProps = {
  initialAccounts: AccountCardType[]
  accountsLength: number
}

const InterestingAccountsPage: NextPage<InterestingAccountsPageProps> = (props) => (
  <>
    <div className='layout-wrapper'>
      <PageContent>
        <AccountsLayout {...props} />
      </PageContent>
    </div>
    <Footer />
  </>
)



export default InterestingAccountsPage