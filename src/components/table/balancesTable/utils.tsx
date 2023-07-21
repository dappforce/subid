import { SubIcon } from '../../utils/index'
import { FaTelegramPlane, FaDiscord } from 'react-icons/fa'
import { FiSend } from 'react-icons/fi'
import { GlobalOutlined, TwitterOutlined, GithubOutlined } from '@ant-design/icons'
import { resolveSubscanUrl } from '../links'
import { LinkWithIcon } from '../utils'
import clsx from 'clsx'
import styles from './Links.module.sass'

type MenuItemsLinkWithLogoProps = {
  link: string
  label: string
  icon: React.ReactNode
}

const MenuItemsLinkWithLogo = ({ link, label, icon }: MenuItemsLinkWithLogoProps) => {
  return <LinkWithIcon link={link} label={label} icon={icon} />
}

type SubscanMenuItemLinkProps = {
  network: string
  address?: string
}

export const SubscanMenuItemLink = ({ network, address }: SubscanMenuItemLinkProps) => {
  if(!address) return null

  const link = resolveSubscanUrl(network, address)

  if (!link) return null

  return <MenuItemsLinkWithLogo link={link} label={'Subscan'} icon='/images/subscan.svg' />
}

export const actionMenuItemsValues: Record<string, LinkIconsAndLabelsValue> = {
  subscanSubdomain: {
    icon: <GlobalOutlined />,
    label: 'Website'
  },
  actionTransfer: {
    icon: <SubIcon Icon={FiSend} className={styles.TransferIcon}/>,
    label: 'Transfer Tokens',
  }
}

export type LinkIconsAndLabelsValue = {
  icon: React.ReactNode
  label: string
}

export const socialMenuItemsValues: Record<string, LinkIconsAndLabelsValue> = {
  website: {
    icon: <GlobalOutlined />,
    label: 'Website'
  },
  twitter: {
    icon: <TwitterOutlined />,
    label: 'Twitter'
  },
  discord: {
    icon: <SubIcon Icon={FaDiscord} />,
    label: 'Discord'
  },
  telegram: {
    icon: <SubIcon Icon={FaTelegramPlane} />,
    label: 'Telegram'
  },
  github: {
    icon: <GithubOutlined />,
    label: 'Github'
  },
}

type ActionButtonProps = {
  label: string
  icon: React.ReactNode
  action?: (e: any) => void
}

export const ActionButton = ({ label, icon, action }: ActionButtonProps) => {
  return <div onClick={action} className='d-flex align-items-center'>
    <div className={clsx(styles.ActionIconWrapp, 'LinkWithIcon')}>{icon}</div>
    <div className='ml-2'>{label}</div>
  </div>
}

export const getBalancePart = (balance: JSX.Element, withMargin?: boolean) => (
  <div className={clsx('d-grid', withMargin && 'mr-4')}>{balance}</div>
)