import React from 'react'
// import { NtfLayout } from '../ntf/NftsLayout'
import { NextPage } from 'next'
import PageContainer from '../utils/PageContainer'
import { useCurrentAccount } from '../providers/MyExtensionAccountsContext'
import dynamic from 'next/dynamic'
import { useFetchNfts } from 'src/rtk/features/nfts/nftsHooks'

const NtfLayout = dynamic(() => import('../ntf/NftsLayout'), { ssr: false })

const NFTsPage: NextPage = () => {
  useFetchNfts()
  
  const addresses = useCurrentAccount()

  return <>
    <PageContainer>
      <NtfLayout addresses={addresses} />
    </PageContainer>
  </>
}



export default NFTsPage