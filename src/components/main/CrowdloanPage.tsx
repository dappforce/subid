import React from 'react'
import PageContainer from '../utils/PageContainer'
import { useCurrentAccount } from '../providers/MyExtensionAccountsContext'
import { useChainInfo } from '../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { useRouter } from 'next/router'

import { RelayChain } from '../../types'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { useDotsamaContributions } from 'src/rtk/features/contributions/contributionsHooks'
// import { useFetchNfts } from 'src/rtk/features/nfts/nftsHooks'

const CrowdloansTable = dynamic(() => import('../table/contributionsTable/CrowdloanTable'), { ssr: false })

const CrowdloanPage: NextPage = () => {
  useDotsamaContributions()
  // useFetchNfts()
  
  const addresses = useCurrentAccount()
  const chainsInfo = useChainInfo()

  const { query } = useRouter()

  const { chainId: relayChain } = query

  return (
    <>
      <PageContainer>
        <CrowdloansTable
          showTabs
          showCheckBox
          addresses={addresses!}
          chainsInfo={chainsInfo}
          relayChain={relayChain as RelayChain}
        />
      </PageContainer>
    </>
  )
}



export default CrowdloanPage