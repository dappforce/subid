import React from 'react'
import PageContainer from '../utils/PageContainer'
import { useChainInfo } from '../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { useCurrentAccount } from '../providers/MyExtensionAccountsContext'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { useFetchBalances } from 'src/rtk/features/balances/balancesHooks'
import { useFetchNfts } from 'src/rtk/features/nfts/nftsHooks'

const BalancesTable = dynamic(
  () => import('../table/balancesTable/BalanceTable'),
  { ssr: false }
)

const BalancesPage: NextPage = () => {
  useFetchBalances()
  useFetchNfts()

  const addresses = useCurrentAccount()
  const chainsInfo = useChainInfo()

  return (
    <>
      <PageContainer>
        <BalancesTable
          showTabs={true}
          showCheckBox={true}
          addresses={addresses!}
          chainsInfo={chainsInfo}
        />
      </PageContainer>
    </>
  )
}

export default BalancesPage
