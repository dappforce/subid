import React from 'react'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { useFetchIdentities } from '../../rtk/features/identities/identitiesHooks'
import { PageContent } from '../utils/PageWrapper'
import { getFavoriteAccountsFromStorage } from '../bookmarks/utils'

const FavoriteAccountsLayout = dynamic(() => import('../bookmarks/table/FavoriteAccountsLayout'), { ssr: false })
const Footer = dynamic(() => import('../footer/Footer'), { ssr: false })

const FavoriteAccountsPage: NextPage = () => {
  const favoriteAccounts = getFavoriteAccountsFromStorage()
  const favoriteAccoutnsKeys = Object.keys(favoriteAccounts)
  useFetchIdentities(favoriteAccoutnsKeys)

  return <>
    <div className='layout-wrapper'>
      <PageContent>
        <FavoriteAccountsLayout />
      </PageContent>
    </div>
    <Footer />
  </>
}



export default FavoriteAccountsPage