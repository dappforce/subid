import React from 'react'
import {
  HomeOutlined,
  BugOutlined,
  BulbOutlined,
  UsergroupAddOutlined,
  WifiOutlined,
  ClockCircleOutlined,
  StarOutlined,
} from '@ant-design/icons'
import {
  useCurrentAccount,
  useIsMulti,
  useIsSignedIn,
} from '../components/providers/MyExtensionAccountsContext'
import { FaTelegramPlane } from 'react-icons/fa'
import { SubIcon } from 'src/components/utils'
import { isEmptyArray, isDef } from '@subsocial/utils'
import { Badge } from 'antd'
import styles from './Sider.module.sass'
import { useChainInfo } from '../rtk/features/multiChainInfo/multiChainInfoHooks'
import {
  evmStakingNetworks,
  supportedStakingNetworks,
} from '../rtk/features/stakingCandidates/utils'
import { MultiChainInfo } from 'src/rtk/features/multiChainInfo/types'
import { validatorStakingNetworks } from '../config/app/network'
import { SiOpencollective } from 'react-icons/si'
import clsx from 'clsx'
import { BiTransferAlt } from 'react-icons/bi'

const issuesUrl = 'https://forms.clickup.com/9008022125/f/8ceq0kd-7261/7PAH62P0XTHM9UIV4Q'

export type Divider = 'Divider'

export const Divider: Divider = 'Divider'

export type PageLink = {
  name: string
  page: string[]
  icon?: React.ReactNode
  hidden?: boolean
  items?: PageLink[]
  isExternalLink?: boolean

  // Helpers
  isNotifications?: boolean
}

type MenuItem = PageLink | Divider

export const isDivider = (item: MenuItem): item is Divider => item === Divider

export const isPageLink = (item: MenuItem): item is PageLink => !isDivider(item)

const getStakingUrls = (chainsInfo: MultiChainInfo) => {
  const stakingChainNames = [ ...evmStakingNetworks, ...supportedStakingNetworks ]

  return stakingChainNames.map((network) => {
    const chainName = chainsInfo?.[network]?.name

    if (!chainName) return

    return {
      name: chainName,
      page: [ '/collator/[network]', `/collator/${network}` ],
    }
  })
}

const getValidatorStakingUrls = (chainsInfo: MultiChainInfo) => {
  return validatorStakingNetworks.map((network) => {
    const { name: chainName, tokenDecimals } = chainsInfo?.[network] || {}

    if (!tokenDecimals) return

    return {
      name: chainName,
      page: [ '/validator/[network]', `/validator/${network}` ],
    }
  })
}

export const DefaultMenu = (t: any, isAllNetworksConnected: boolean) => {
  const addresses = useCurrentAccount()
  const isSignIn = useIsSignedIn()
  const chainInfo = useChainInfo()
  const isMulti = useIsMulti()

  if (!addresses || isEmptyArray(addresses)) return []

  const addressForUrl = addresses?.join(',') || ''

  const stakingItems = getStakingUrls(chainInfo)
  const validatorStakingItems = getValidatorStakingUrls(chainInfo)

  return [
    {
      name: t('general.home'),
      page: [ '/[address]', `/${addressForUrl}` ],
      icon: <HomeOutlined />,
    },
    {
      name: 'Transfer',
      page: [ '/send/[transferType]', '/send/same' ],
      icon: <SubIcon Icon={BiTransferAlt} />,
    },
    {
      name: t('crowdloan.crowdloans'),
      page: [ '/[address]/crowdloans', `/${addressForUrl}/crowdloans` ],
      icon: <img className='anticon' src='/images/crowdloan.svg' />,
      items: [
        {
          name: 'Polkadot',
          page: [
            '/[address]/crowdloans/[chainId]',
            `/${addressForUrl}/crowdloans/polkadot`,
          ],
        },
        {
          name: 'Kusama',
          page: [
            '/[address]/crowdloans/[chainId]',
            `/${addressForUrl}/crowdloans/kusama`,
          ],
        },
      ],
    },
    {
      name: t('interestingAccounts.title'),
      page: [ '/[address]/accounts', `/${addressForUrl}/accounts` ],
      icon: <UsergroupAddOutlined />,
    },
    {
      name: t('favoritesAccounts.title'),
      page: [ '/[address]/favorites', `/${addressForUrl}/favorites` ],
      icon: <StarOutlined />,
    },
    {
      name: t('staking.sideMenuTitle'),
      page: [ '/collator' ],
      icon: <ClockCircleOutlined />,
      items: stakingItems.filter(isDef),
      hidden: isMulti || !isSignIn,
    },
    {
      name: t('validatorStaking.sideMenuTitle'),
      page: [ '/validator' ],
      icon: <SubIcon Icon={SiOpencollective}/>,
      items: validatorStakingItems.filter(isDef),
      hidden: isMulti || !isSignIn,
    },
    {
      name: 'Creator Staking',
      page: [ '/creators' ],
      icon: <img className='anticon' src='/images/creator-staking-user.svg' />,
      hidden: !isSignIn,
    },
    Divider,
    {
      name: t('general.networkStatus'),
      page: [ '/status' ],
      icon: isAllNetworksConnected ? (
        <WifiOutlined />
      ) : (
        <Badge dot status='warning' className={clsx(styles.ConnectionStatusDot, 'anticon')}>
          <WifiOutlined />
        </Badge>
      ),
    },
    {
      name: t('general.suggestFeature'),
      page: [ 'https://forms.gle/7HDQUyKD5gecwaTYA' ],
      icon: <BulbOutlined />,
      isExternalLink: true,
    },
    {
      name: t('general.reportBug'),
      page: [ issuesUrl ],
      icon: <BugOutlined />,
      isExternalLink: true,
    },
    Divider,
    {
      name: 'Subsocial',
      page: [ 'https://subsocial.network' ],
      icon: <img className='anticon' src='/images/subsocial-pink.svg' />,
      isExternalLink: true,
    },
    {
      name: 'Telegram Bot',
      page: [ 'https://t.me/sub_id_bot' ],
      icon: <SubIcon Icon={FaTelegramPlane} />,
      isExternalLink: true,
    },
  ]
}
