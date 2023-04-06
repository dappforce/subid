import { LinkWithIcon } from '../utils'
import { linksByNetworks, NetworkLinks } from '../links'
import { Menu, Dropdown, Button, Divider } from 'antd'
import { useCurrentAccount } from '../../providers/MyExtensionAccountsContext'
import { MoreOutlined } from '@ant-design/icons'
import styles from './Links.module.sass'
import { isDef } from '@subsocial/utils'
import clsx from 'clsx'
import { useState } from 'react'
import { useResponsiveSize } from '../../responsive/ResponsiveContext'
import { 
  socialMenuItemsValues, 
  actionMenuItemsValues, 
  SubscanMenuItemLink, 
  ActionButton, 
  LinkIconsAndLabelsValue
} from './utils'
import { SubIcon } from 'src/components/utils'
import { AiFillAppstore } from 'react-icons/ai'
  
type LinkButtonsOverlayProps = {
  network: string
  address?: string
  links: Partial<NetworkLinks>
  action?: (e: any) => void
  hide: () => void
  showActionButton?: boolean
}

type ViewByNetwork = LinkButtonsOverlayProps & {
  values: LinkIconsAndLabelsValue
  fieldName: string
}

const getViewByFieldName = ({ 
  network, 
  address, 
  links, 
  action, 
  hide,
  showActionButton = true, 
  values, 
  fieldName 
}: ViewByNetwork) => {
  const onAction = (e: any) => {
    action?.(e)
    hide()
  }

  const viewByFieldName: Record<string, () => React.ReactNode> = {
    subscanSubdomain: () => {
      if(!links.subscanSubdomain) return 
        return <SubscanMenuItemLink network={network} address={address} />
    },
    actionTransfer: () => {
      if(!showActionButton) return
        const { label, icon } = values
        return <ActionButton label={label} icon={icon} action={onAction} /> 
    }
  }

  return viewByFieldName[fieldName]?.()
}

const LinkButtonsOverlay = ({ network, address, links, action, hide, showActionButton = true }: LinkButtonsOverlayProps) => {
  const socialMenuItemsValuesEntries = Object.entries(socialMenuItemsValues)
  const actionMenuItemsValuesEntries = Object.entries(actionMenuItemsValues)

  const actionMenuItems = actionMenuItemsValuesEntries.map(([ fieldName, values ], i) => {
    let menuItem = getViewByFieldName({ 
      network,
      address,
      links,
      action,
      hide,
      showActionButton,
      fieldName,
      values
     })

    if(!menuItem) return

    return <Menu.Item key={`${fieldName}-${i}`}>
      {menuItem}
    </Menu.Item>
  }).filter(isDef)

  const socialMenuItems = socialMenuItemsValuesEntries.map(([ fieldName, values ], i) => {
    const { label, icon } = values || {}
    const link = links?.[fieldName as keyof NetworkLinks]

    if(!link) return

    return <Menu.Item key={`${fieldName}-${i}`}>
      <LinkWithIcon label={label} icon={icon} link={link as string} />
    </Menu.Item>
  }).filter(isDef)

  const appsLinks = links.apps?.map(({ label, url }, i) => {
    return <Menu.Item key={i}>
    <LinkWithIcon label={label || 'DApp'} icon={<SubIcon Icon={AiFillAppstore} />} link={url} />
  </Menu.Item>
  })

  return <Menu selectable={false}>
    {actionMenuItems.length && <>
      {actionMenuItems}
      <div className={styles.MoreButtonDividor}><Divider /></div>
    </>}
    {socialMenuItems}
    {appsLinks?.length && <>
      <div className={styles.MoreButtonDividor}><Divider /></div>
      {appsLinks}
    </>}
  </Menu>
}

type LinksButtonProps = {
  network: string
  action?: (e: any) => void
  showActionButton?: boolean
}

export const LinksButton = ({ network, action, showActionButton }: LinksButtonProps) => {
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
      showActionButton={showActionButton}
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