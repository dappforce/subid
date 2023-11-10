import React, { useState } from 'react'
import { Menu, Button, Dropdown } from 'antd'
import { GlobalOutlined, UpOutlined } from '@ant-design/icons'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { DefaultMenu, isDivider, PageLink } from './SideMenuItems'
import i18n from 'i18next'
import { useTranslation } from 'react-i18next'
import languages from '../config/languages'
import styles from './Sider.module.sass'
import clsx from 'clsx'
import { useIsAllNetworksConnected } from '../components/statusPage/utils/StatusCards'
import { isServerSide } from 'src/components/utils'
import { useSidebarCollapsed } from 'src/components/providers/SideBarCollapsedContext'

const renderPageLink = (item: PageLink) => {
  const { items, icon, isExternalLink } = item

  if (items) {
    return (
      <Menu.SubMenu
        className={clsx('DfMenuItem DfSubMenu', { ['d-none']: !isServerSide() && item.hidden }) }
        key={item.page[1] || item.page[0]}
        title={<span className='MenuItemName'>{item.name}</span>}
        icon={icon}
      >
        {items.map((item) => renderPageLink(item))}
      </Menu.SubMenu>
    )
  }

  const externalLinkProps = isExternalLink ? { target: '_blank', rel: 'noreferrer' } : {}

  return (
    <Menu.Item className={clsx('DfMenuItem', { ['d-none']: !isServerSide() && item.hidden }) } key={item.page[1] || item.page[0]}>
      <Link href={item.page[0]} as={item.page[1]} passHref={isExternalLink} legacyBehavior>
        <a {...externalLinkProps}>
          {icon}
          <span className='MenuItemName'>{item.name}</span>
        </a>
      </Link>
    </Menu.Item>
  )
}

function SideMenu () {
  const { asPath } = useRouter()
  const [ visible, setVisible ] = useState(false)
  const { t } = useTranslation()
  const status = useIsAllNetworksConnected()
  const { state: { collapsed } } = useSidebarCollapsed()

  const menuItems = DefaultMenu(t, status)

  return (
    <div className={clsx('d-flex flex-column justify-content-between h-100 w-100', styles.SiderOverflow)}>
      <Menu
        selectedKeys={[ asPath ]}
        mode='inline'
        theme='light'
        className={styles.Menu}
        style={{ borderRight: 0, borderBottom: 0 }}
      >
        {menuItems.map((item, i) => isDivider(item)
          ? <Menu.Divider key={`divider-${i}`} className={styles.SiderDivider} />
          : renderPageLink(item)
        )}
      </Menu>
      {!collapsed && (
        <div className={clsx('bs-mx-4 my-4 my-lg-3')}>
          <Dropdown
            trigger={[ 'click' ]}
            visible={visible}
            onVisibleChange={setVisible}
            placement='topCenter'
            getPopupContainer={trigger => (trigger?.parentNode as HTMLElement) || document.body}
            overlay={<Menu onClick={(item: any) => {
              i18n.changeLanguage(item.key)
              setVisible(false)
            }}>
              {Object.keys(languages).map(lang => (<Menu.Item key={lang}>{languages[lang]}</Menu.Item>))}
            </Menu>}
          >
            <Button className={clsx('d-flex align-items-center bs-px-2', styles.LanguageDropdown)} shape='round'>
              <GlobalOutlined className='m-0' /> {i18n.language.toUpperCase()} <UpOutlined />
            </Button>
          </Dropdown>
        </div>
      )}
    </div>
  )
}

export default SideMenu
