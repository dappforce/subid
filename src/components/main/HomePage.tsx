import React from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useCurrentAccount } from '../providers/MyExtensionAccountsContext'
import PageContainer from '../utils/PageContainer'
import { isDef } from '@subsocial/utils'
import dynamic from 'next/dynamic'
import { useFetchBalances } from '@/rtk/features/balances/balancesHooks'

const HomePageLayout = dynamic(() => import('../homePage/HomePageLayout'), { ssr: false })

const HomePage: NextPage = () => {
  useFetchBalances()

  const { query } = useRouter()
  const { address: maybeAddress } = query

  const addressFromUrl = maybeAddress?.toString()
  const addresses = (useCurrentAccount() || [ addressFromUrl ]).filter(isDef)

  return (
    <PageContainer isHomePage >
      <HomePageLayout addresses={addresses} />
    </PageContainer>
  )
}



export default HomePage