import React from 'react'
import PageContainer from '../utils/PageContainer'
import { NextPage } from 'next'
import { useFetchBalances } from 'src/rtk/features/balances/balancesHooks'

// const BalancesTable = dynamic(
//   () => import('../table/balancesTable/BalanceTable'),
//   { ssr: false }
// )

const BalancesPage: NextPage = () => {
  useFetchBalances()

  // const addresses = useCurrentAccount()
  // const chainsInfo = useChainInfo()

  return (
    <>
      <PageContainer>
        {/* <BalancesTable
          showTabs={true}
          showCheckBox={true}
          addresses={addresses!}
          chainsInfo={chainsInfo}
        /> */}
      </PageContainer>
    </>
  )
}

export default BalancesPage
