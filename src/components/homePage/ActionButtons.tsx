import { useIsMulti, useIsMyAddress, useIsMyConnectedAddress } from '../providers/MyExtensionAccountsContext'
import { Button, Tooltip } from 'antd'
import { subAppBaseUrl } from 'src/config/env'
import { ExternalLink } from '../identity/utils'
import BookmarksModal from '../bookmarks/BokmarksModal'
import { StarOutlined, StarFilled } from '@ant-design/icons'
import styles from './address-views/utils/index.module.sass'
import clsx from 'clsx'
import { accountIdToSubsocialAddress } from '../utils'
import { useState } from 'react'
import { useGetFavoritesAccounts } from '../bookmarks/utils'
import { AccountIdentities } from '../identity/types'
import { useTranslation } from 'react-i18next'
import dynamic from 'next/dynamic'
import { getSubsocialIdentity } from '../../rtk/features/identities/identitiesHooks'
import { useBuildSendEvent } from '../providers/AnalyticContext'

type ActionButtonsProps = {
  address?: string
  showFollowButton: boolean
  identities?: AccountIdentities
}

const TransferModal = dynamic(() => import('src/components/transfer/TransferModal'), { ssr: false })

const ActionButtons = ({ address, showFollowButton, identities }: ActionButtonsProps) => {
  const isMulti = useIsMulti()
  const [ openTransferModal, setOpenTransferModal ] = useState(false)
  const isMyConnectedAddress = useIsMyConnectedAddress(address ?? '')
  const [ refresh, setRefresh ] = useState<boolean>(true)
  const { t } = useTranslation()

  const favoriteAccounts = useGetFavoritesAccounts(refresh, () => setRefresh(false))
  const isMyAccount = useIsMyAddress(address)

  const isInFavorites = Object.keys(favoriteAccounts).find((value) => value === address)
  const subsocialIdentity = getSubsocialIdentity(identities)

  const sendFollowEvent = useBuildSendEvent(
    'click_on_the_follow_button'
  )
  const sendEditEvent = useBuildSendEvent('click_on_the_edit_button')
  const sendDonateEvent = useBuildSendEvent('click_on_the_donate_button')

  const onAddButtonClick = () => {
    setRefresh(true)
  }

  return <div className='ml-3 d-flex align-items-center'>
    {!isMulti && !isMyConnectedAddress && (
      <Button
        type='primary'
        onClick={() => {
          setOpenTransferModal(true)
          sendDonateEvent()
        }}
        className={styles.FollowButton}
      >
        {t('donation.donate')}
      </Button>
    )}
    {showFollowButton && address ? (
      <Tooltip title={t('buttons.followTooltip')}>
        <Button
          type='primary'
          ghost
          onClick={sendFollowEvent}
          className={`${styles.FollowButton} ml-2`}
        >
          <ExternalLink
            url={`${subAppBaseUrl}/accounts/${accountIdToSubsocialAddress(address)}`}
            value={t('buttons.follow')}
          />
        </Button>
      </Tooltip>
    ) : (
      identities?.subsocial ? (
        <Button
          type='primary'
          ghost
          onClick={sendEditEvent}
          className={`${styles.FollowButton} ml-2`}
        >
          <ExternalLink
            url={`${subAppBaseUrl}/${subsocialIdentity?.id}/edit`}
            value={t('buttons.editProfile')}
          />
        </Button>
      ) : null
    )}
    {!isMulti && !isMyAccount && (
      <BookmarksModal
        additionalAddFn={onAddButtonClick}
        removeOnDobleClick
        setRefresh={setRefresh}
        actionButtonIcon={
          isInFavorites
            ? <Tooltip title={t('favoritesAccounts.tooltips.star')}><StarFilled className={clsx(styles.ActiveStarFont, 'ActiveStar')} /></Tooltip>
            : <StarOutlined className='BookmarkStar'/>
        }
        buttonClassName={clsx('ml-2', styles.StarButton)}
      />
    )}
    <TransferModal
      defaultRecipient={address}
      visible={openTransferModal}
      onCancel={() => setOpenTransferModal(false)}
    />
  </div >
}

export default ActionButtons