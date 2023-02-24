import { LinkWithIcon } from '../utils'
import { resolveSubscanUrl, linksByNetworks, NetworkLinks } from '../links'
import { Menu, Dropdown, Button, Divider } from 'antd'
import { useCurrentAccount } from '../../providers/MyExtensionAccountsContext'
import { MoreOutlined, GlobalOutlined, TwitterOutlined, GithubOutlined } from '@ant-design/icons'
import styles from './Links.module.sass'
import { SubIcon } from '../../utils/index'
import { RiDiscordLine } from 'react-icons/ri' 
import { FaTelegramPlane } from 'react-icons/fa'
import { AiFillAppstore } from 'react-icons/ai'
import { FiSend } from 'react-icons/fi'
import { isDef } from '@subsocial/utils'
import clsx from 'clsx'
import { useState } from 'react'
import { useResponsiveSize } from '../../responsive/ResponsiveContext'

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

const SubscanMenuItemLink = ({ network, address }: SubscanMenuItemLinkProps) => {
  if(!address) return <></>

  const link = resolveSubscanUrl(network, address)

  if (!link) return <></>

  return <MenuItemsLinkWithLogo link={link} label={'Subscan'} icon='/images/subscan.svg' />
}

const actionMenuItemsValues: Record<string, LinkIconsAndLabelsValue> = {
  subscanSubdomain: {
    icon: <GlobalOutlined />,
    label: 'Website'
  },
  actionTransfer: {
    icon: <SubIcon Icon={FiSend} className={styles.TransferIcon}/>,
    label: 'Transfer Tokens',
  }
}

type LinkIconsAndLabelsValue = {
  icon: React.ReactNode
  label: string
}

const socialMenuItemsValues: Record<string, LinkIconsAndLabelsValue> = {
  website: {
    icon: <GlobalOutlined />,
    label: 'Website'
  },
  twitter: {
    icon: <TwitterOutlined />,
    label: 'Twitter'
  },
  discord: {
    icon: <SubIcon Icon={RiDiscordLine} />,
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
  app: {
    icon: <SubIcon Icon={AiFillAppstore} />,
    label: 'DApp'
  }
}

type ActionButtonProps = {
  label: string
  icon: React.ReactNode
  action?: (e: any) => void
}

const ActionButton = ({ label, icon, action }: ActionButtonProps) => {
  return <div onClick={action} className='d-flex align-items-center'>
    <div className={clsx(styles.ActionIconWrapp, 'LinkWithIcon')}>{icon}</div>
    <div className='ml-3'>{label}</div>
  </div>
}

type LinkButtonsOverlayProps = {
  network: string
  address?: string
  links: Partial<NetworkLinks>
  action?: (e: any) => void
  hide: () => void
}

const LinkButtonsOverlay = ({ network, address, links, action, hide }: LinkButtonsOverlayProps) => {
  const socialMenuItemsValuesEntries = Object.entries(socialMenuItemsValues)
  const actionMenuItemsValuesEntries = Object.entries(actionMenuItemsValues)

  const actionMenuItems = actionMenuItemsValuesEntries.map(([ fieldName, values ], i) => {
    let menuItem = undefined

    const onAction = (e: any) => {
      action?.(e)
      hide()
    }

    switch (fieldName) {
      case 'subscanSubdomain':
        menuItem = <SubscanMenuItemLink network={network} address={address} />
        break
      case 'actionTransfer':
        if(!action) break
        const { label, icon } = values
        menuItem = <ActionButton label={label} icon={icon} action={onAction} /> 
        break
      default:
        break
    }

    if(!menuItem) return

    return <Menu.Item key={i}>
      {menuItem}
    </Menu.Item>
  }).filter(isDef)

  const socialMenuItems = socialMenuItemsValuesEntries.map(([ fieldName, values ], i) => {
    const { label, icon } = values || {}
    const link = links?.[fieldName as keyof NetworkLinks]

    if(!link) return

    return <Menu.Item key={i}>
      <LinkWithIcon label={label} icon={icon} link={link} />
    </Menu.Item>
  }).filter(isDef)

  return <Menu selectable={false}>
    {actionMenuItems}
    {socialMenuItems.length && <>
      <div className={styles.MoreButtonDividor}><Divider /></div>
      {socialMenuItems}
    </>}
  </Menu>
}

type LinksButtonProps = {
  network: string
  action?: (e: any) => void
}

export const LinksButton = ({ network, action }: LinksButtonProps) => {
  const myAddress = useCurrentAccount()[0]
  const [ visible, setVisible ] = useState(false)
  const links = linksByNetworks[network] 
  const { isMobile } = useResponsiveSize()

  if(!links) return null

  const onMoreButtonClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    e.preventDefault()
    setVisible(!visible)
  }

  return <Dropdown
    overlay={<LinkButtonsOverlay 
      network={network} 
      address={myAddress} 
      hide={() => setVisible(false)} 
      links={links} 
      action={action} 
    />}
    onVisibleChange={(visibility) => setVisible(visibility)}
    overlayClassName={clsx(styles.DropdownOverlay, { ['ant-dropdown-hidden']: !visible })}
    placement={isMobile ? 'bottomRight' : 'bottomCenter'}
    trigger={[ 'click' ]}
    
  >
    <Button 
      type='link' 
      className={styles.MoreButtonLink}
      ghost
      onClick={onMoreButtonClick}
    >
      <MoreOutlined />
    </Button>
  </Dropdown>
}