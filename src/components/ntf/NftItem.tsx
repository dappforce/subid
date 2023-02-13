import { IpfsCid } from '@subsocial/types'
import { nonEmptyStr } from '@subsocial/utils'
import { NftViewProps } from './NftView'
import { SpaceData } from '@subsocial/types/dto'
import React, { useState } from 'react'
import { useAppDispatch } from 'src/rtk/app/store'
import { getIpfs } from '../utils/getIpfs'
import LazyTxButton, { TxCallback, TxFailedCallback } from '../lazy-connection/LazyTxButton'
import { fetchIdentities } from '../../rtk/features/identities/identitiesHooks'
import { getTxParams, ExtendedSpaceContent } from '../utils/getTxParams'
import NftView from './NftView'
import { useMyAddress } from '../providers/MyExtensionAccountsContext'
import styles from './NftsLayout.module.sass'
import { useTranslation } from 'react-i18next'
import { getAddressFromStorage } from '../utils/index'
import { CheckOutlined } from '@ant-design/icons'
import clsx from 'clsx'
import { useBuildSendGaUserEvent } from 'src/ga'

const createIpfsContent = (value: IpfsCid) => ({ IPFS: value })

const createNoneContent = () => ({ None: null })

const createContent = (value?: IpfsContentValue) => nonEmptyStr(value)
  ? createIpfsContent(value)
  : createNoneContent()

type IpfsContentValue = IpfsCid | null

export function IpfsContent (value?: IpfsContentValue) {
  return createContent(value)
}

export function OptionIpfsContent (value?: IpfsContentValue) {
  return value ? createIpfsContent(value) : null
}

type NftItemProps = NftViewProps & {
  withConnection?: boolean
  owner?: SpaceData
  hasProfile: boolean
  hide?: () => void
  hasTokens?: boolean
  selected?: boolean
}

type NftItemTxButtonProps = NftItemProps & {
  Component: React.FunctionComponent
}

const NftItemTxButton = ({ owner, hasProfile, Component, hide, ...props }: NftItemTxButtonProps) => {
  const [ IpfsCid, setIpfsCid ] = useState<IpfsCid>()
  const sendUpdateNftBannerEvent = useBuildSendGaUserEvent('Update NFT Banner')

  const myAddress = useMyAddress()
  const dispatch = useAppDispatch()

  const ipfs = getIpfs()

  const { id, network } = props.nft
  const { name = '', image = '', about = '' } = owner?.content || {}

  const profileStruct = { name, image, about }

  const newTxParams = (cid: IpfsCid) => {
    function getCidIfChanged (): IpfsCid | undefined {
      const prevCid = owner?.struct.contentId
      return prevCid !== cid.toString() ? cid : undefined
    }

    if (!hasProfile) {
      return [ IpfsContent(cid) ]
    } else {
      const update = {
        content: OptionIpfsContent(getCidIfChanged())
      }

      return [ owner?.struct.id, update ]
    }
  }

  const onFailed: TxFailedCallback = () => {
    IpfsCid && ipfs.removeContent(IpfsCid).catch(err => new Error(err))
  }

  const onSuccess: TxCallback = () => {
    const addresses = getAddressFromStorage().split(',')
    fetchIdentities(dispatch, addresses || [], true)
    hide?.()
  }

  const pinToIpfsAndBuildTxParams = () => getTxParams({
    json: { ...profileStruct, banner: `${network}://${id}` },
    buildTxParamsCallback: newTxParams,
    setIpfsCid,
    ipfs
  })

  const onClick = () => {
    props.onCardClick?.()
    sendUpdateNftBannerEvent()
  }

  return <LazyTxButton
    network='subsocial'
    accountId={myAddress}
    tx={hasProfile
      ? 'spaces.updateSpace'
      : 'spaces.createSpace'}
    disabled={false}
    component={Component}
    params={pinToIpfsAndBuildTxParams}
    onFailed={onFailed}
    onSuccess={onSuccess}
    onClick={onClick}
  />
}

const NftItem = ({ withConnection = false, owner, hasProfile, hasTokens, nft, hide, ...props }: NftItemProps) => {
  const { t } = useTranslation()
  const sendOpenNftEvent = useBuildSendGaUserEvent('Open NFT Link')

  const { banner } = owner?.content as ExtendedSpaceContent | undefined || {}

  const { id, network } = nft

  const bannerId = banner?.replace(`${network}://`, '')

  const Component: React.FunctionComponent<{ onClick?: () => void }> = (compProps) => <div {...compProps}>
    <NftView nft={nft} {...props} />
  </div>

  return withConnection ?
    <div className={clsx({ [styles.NftTx]: bannerId === id })}>
      {!hasTokens && <div className={styles.NoTokensOverlay}>{t('banner.modal.moreTokensMsg')}</div>}
      {bannerId === id && <div className={styles.SelectedItem}><CheckOutlined /></div>}
      <NftItemTxButton
        owner={owner}
        hasProfile={hasProfile}
        hide={hide}
        Component={Component}
        nft={nft}
        {...props}
      />
    </div>
    : <Component onClick={sendOpenNftEvent} />
}

export default NftItem