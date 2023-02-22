import React, { useState } from 'react'
import { toGenericAccountId } from 'src/rtk/app/util'
import { Card } from 'antd'
import styles from './InterestingAccounts.module.sass'
import { useIdentitiesByAccounts, getSubsocialIdentity } from '../../rtk/features/identities/identitiesHooks'
import Name from '../homePage/address-views/Name'
import { AccountCardType } from './types'
import BaseAvatar from '../utils/DfAvatar'
import { resolveSvgIcon } from './utils'
import { getIconUrl } from '../utils'
import { getBalanceWithDecimals, LabelWithShortMoneyFormat } from '../table/utils'
import BN from 'bignumber.js'
import { useChainInfo } from '../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { isEmptyArray } from '@subsocial/utils'
import clsx from 'clsx'
import { capitalize } from 'lodash'
import BookmarksModal from '../bookmarks/BokmarksModal'
import { StarFilled, StarOutlined } from '@ant-design/icons'
import { useGetFavoritesAccounts } from '../bookmarks/utils'

type AccountCardProps = {
  accountData: AccountCardType
  className?: string
}

export const AccountCard = ({ accountData, className }: AccountCardProps) => {
  const [ refresh, setRefresh ] = useState<boolean>(true)

  const onAddButtonClick = () => {
    setRefresh(true)
  }

  const favoriteAccounts = useGetFavoritesAccounts(refresh, () => setRefresh(false))

  const chainsInfo = useChainInfo()

  const { account: address, amount, relayChain, type } = accountData

  const identities = useIdentitiesByAccounts([ address ])

  const accountIdentities = address ? identities![toGenericAccountId(address)] : undefined

  const owner = getSubsocialIdentity(accountIdentities)

  const { tokenDecimals, tokenSymbols } = chainsInfo[relayChain] || {}

  const decimals = tokenDecimals && !isEmptyArray(tokenDecimals) ? tokenDecimals[0] : 0
  const symbol = tokenSymbols && !isEmptyArray(tokenSymbols) ? tokenSymbols[0] : ''

  const amountBN = amount ? getBalanceWithDecimals({ totalBalance: new BN(amount).toString(), decimals }) : undefined

  const amountView = amountBN ? <LabelWithShortMoneyFormat value={amountBN} symbol={symbol} /> : undefined

  const description = <div className={styles.DescriptionSection}>
    {capitalize(relayChain)} {capitalize(type)}

    {amountView && <div className='mt-1'>Locked: <span className={styles.AmountValue}>{amountView}</span></div>}
  </div>

  const isAccountInFavorites = Object.keys(favoriteAccounts).find((value) => value === toGenericAccountId(address))

  return <a href={`/${address}`} target='_blank' rel='noreferrer'>
    <Card
      className={clsx(styles.ProfileCard, className)}
      hoverable
      cover={
        <div className={styles.CardCoverBody}>
          <BookmarksModal
            actionButtonIcon={isAccountInFavorites
              ? <StarFilled className='BookmarkStar ActiveStar' />
              : <StarOutlined className='BookmarkStar' />}
            address={address}
            additionalAddFn={onAddButtonClick}
            removeOnDobleClick
            setRefresh={setRefresh}
            buttonType='link'
            buttonClassName={clsx(styles.CardStarButton, { [styles.CardStarButtonVisible]: isAccountInFavorites })}
          />
          <div className={styles.CardCoverAvatar} style={{ width: '84px', position: 'relative' }}>
            <BaseAvatar size={76} address={address} avatar={owner?.image} />
            <img src={getIconUrl(resolveSvgIcon(relayChain))} className={styles.RelayChain} />
          </div>
        </div>
      }
    >
      <Card.Meta
        className={styles.Title}
        title={<Name identities={accountIdentities} address={address} />}
        description={description}
      />
    </Card>
  </a>
}