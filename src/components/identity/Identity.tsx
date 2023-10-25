import React, { useEffect, useState } from 'react'
import { Tabs, Tooltip } from 'antd'
import { isDef } from '@subsocial/utils'
import { identityInfoKeys, IdentityBareProps, Identity, AccountIdentities } from './types'
import { getIconUrl, startWithUpperCase } from '../utils'
import { getKusamaItem } from './utils'
import styles from './Identity.module.sass'
import { InfoPanel, InfoPanelProps } from '../homePage/address-views/InfoSection/index'
import { DfBgImg } from '../utils/DfBgImg'
import { CheckCircleFilled } from '@ant-design/icons'
import { useResponsiveSize } from '../responsive/ResponsiveContext'
import { ChainWithIdentity } from '../../types'
import { useChainInfo } from '../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { SectionTitle } from '../utils/index'
import clsx from 'clsx'

const { TabPane } = Tabs

type IdentityProps = IdentityBareProps & {
  title?: React.ReactNode
  size?: 'middle' | 'small' | 'default'
  column?: number
  layout?: 'vertical' | 'horizontal'
  withTitle?: boolean
  withSection?: boolean
}

type TabNameWithLogoProps = {
  network: string
  isVerify: boolean
}

const VerifiedIcon = <CheckCircleFilled className={styles.VerifiedIcon} />

export const IdentityTitle = ({ isVerify, network }: TabNameWithLogoProps) => {
  const title = (
    <div>
      {isVerify ? (
        <>
          {VerifiedIcon}
          <span>Verified {network} identity</span>
        </>
      ) : (
        <>{startWithUpperCase(network)} identity</>
      )}
    </div>
  )

  return <span className={styles.TitleText}>{title}</span>
}

const TabNameWithLogo = ({ network, isVerify }: TabNameWithLogoProps) => {
  const chains = useChainInfo()
  const chainIcon = chains[network].icon
  const imgUrl = getIconUrl(chainIcon)

  return (
    <div className='d-flex'>
      <Tooltip
        placement='top'
        color='#fafafa'
        title={<IdentityTitle isVerify={isVerify} network={network} />}
      >
        <span className={`${styles.IdentityIcon} ${isVerify ? styles.verified : ''}`}>
          <DfBgImg src={imgUrl} size={16} rounded />
        </span>
      </Tooltip>

      <span>{startWithUpperCase(network)}</span>
    </div>
  )
}

const getTab = (identities?: AccountIdentities): ChainWithIdentity | '' => {
  if (identities) {
    const { polkadot, kusama, shiden } = identities

    if (polkadot) return 'polkadot'
    if (kusama) return 'kusama'
    if (shiden) return 'shiden'
  }

  return ''
}

export const IdentityView = ({ details, ...props }: IdentityProps) => {
  const { isMobile } = useResponsiveSize()
  const tab = getTab(details)

  const [ tabKey, setTab ] = useState(tab)

  useEffect(() => setTab(tab), [ tab ])

  if (!details) return null

  const chain = tabKey && details[tabKey]

  if (!chain) return null

  const { info, isVerify } = chain as Identity
  const items = identityInfoKeys
    .map((key) => ({
      label: startWithUpperCase(key),
      value: getKusamaItem(key, info[key] || '')
    }))
    .filter((x) => isDef(x.value))

  const onTabChange = (key: string) => setTab(key as ChainWithIdentity)

  const infoProps: InfoPanelProps = {
    ...props,
    items,
    className: styles.IdentitySection,
    column: isMobile ? 1 : 2,
    layout: isMobile ? 'horizontal' : 'vertical'
  }

  const renderTab = (network: ChainWithIdentity) =>
    details[network] && (
      <TabPane tab={<TabNameWithLogo isVerify={isVerify} network={network} />} key={network} />
    )

  const kusamaTab = renderTab('kusama')
  const polkadotTab = renderTab('polkadot')
  const shidenTab = renderTab('shiden')

  return (
    <div>
      <SectionTitle 
        title='On-chain identity'
        className={clsx({ ['pr-3 pl-3']: isMobile }, styles.TitleMargin)}
      /> 
      <div className={styles.IdentityBlock}>
        <Tabs activeKey={tabKey} onChange={onTabChange} className='bs-mb-0'>
          {polkadotTab}
          {kusamaTab}
          {shidenTab}
        </Tabs>
        <InfoPanel {...infoProps} />
      </div>
    </div>
  )
}
