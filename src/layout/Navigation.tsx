import React, { FunctionComponent, useEffect, useMemo } from 'react'
import { Layout, Drawer } from 'antd'
import { useSidebarCollapsed } from '../components/providers/SideBarCollapsedContext'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import dynamic from 'next/dynamic'
import styles from './Sider.module.sass'
import { useCurrentAccount } from '../components/providers/MyExtensionAccountsContext'
import ChatSidePanel from 'src/components/chat/ChatSidePanel'
import { useResponsiveSize } from 'src/components/responsive'

const TopMenu = dynamic(() => import('../components/topMenu/TopMenu'), { ssr: false })
const Menu = dynamic(() => import('./SideMenu'), { ssr: false })

const { Sider, Content } = Layout
interface Props {
  children: React.ReactNode
}

const HomeNav = () => {
  const { state: { collapsed }, hide, show } = useSidebarCollapsed()

  return <Sider
    className='DfSider'
    width='230'
    trigger={null}
    collapsible
    collapsed={collapsed}
    onMouseOver={() => show()}
    onMouseLeave={() => hide()}
  >
    <Menu />
  </Sider>
}

const DefaultNav: FunctionComponent = () => {
  const { state: { collapsed }, hide } = useSidebarCollapsed()
  const { asPath } = useRouter()

  useEffect(() => hide(), [ asPath ])

  return <Drawer
    className='DfSideBar h-100'
    bodyStyle={{ padding: 0 }}
    placement='left'
    closable={false}
    onClose={hide}
    visible={!collapsed}
    getContainer={false}
    keyboard
  >
    <Menu />
  </Drawer>
}

export const Navigation = (props: Props): JSX.Element => {
  const { children } = props
  const { state: { asDrawer } } = useSidebarCollapsed()
  const { isLargeDesktop } = useResponsiveSize()
  const { asPath } = useRouter()

  const currentAccount = useCurrentAccount()

  const content = useMemo(() => <Content
    className={clsx(
      'DfPageContent',
      styles.PagePadding,
     )}
    >
      {children}
    </Content>, [ children ]
  )

  const sideMenu = asDrawer ? <DefaultNav /> : <HomeNav />

  return <Layout className='min-vh-100'>
    {asPath !== '/' && !asPath.startsWith('/#') ? <TopMenu /> : null}
    <Layout className={clsx('ant-layout-has-sider', { ['mt-0']: asPath === '/' })}>
      {currentAccount && sideMenu}
      {content}
      {isLargeDesktop && <ChatSidePanel />}
    </Layout>
  </Layout>
}
