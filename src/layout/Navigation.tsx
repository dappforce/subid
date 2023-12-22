import React, { useMemo } from 'react'
import { Layout } from 'antd'
import { useSidebarCollapsed } from '../components/providers/SideBarCollapsedContext'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import dynamic from 'next/dynamic'
import styles from './Sider.module.sass'
import { useCurrentAccount } from '../components/providers/MyExtensionAccountsContext'

const DefaultNav = dynamic(() => import('./DefaultNav'), { ssr: false })
const HomeNav = dynamic(() => import('./HomeNav'), { ssr: false })
const TopMenu = dynamic(() => import('../components/topMenu/TopMenu'), { ssr: false })

const { Content } = Layout
interface Props {
  children: React.ReactNode
}


const Navigation = (props: Props): JSX.Element => {
  const { children } = props
  const { state: { asDrawer } } = useSidebarCollapsed()
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

  const sideMenu = asDrawer ? <DefaultNav /> : <><HomeNav /><DefaultNav className='DfDesktopDrawer' /></>

  const isHomePage = asPath === '/' || asPath.startsWith('/#')

  return <Layout className='min-vh-100'>
    {!isHomePage ? <TopMenu /> : null}
    <Layout className={clsx('ant-layout-has-sider', { ['mt-0']: asPath === '/' })}>
      {currentAccount && sideMenu}
      {content}
      {/* {!isHomePage && !isCreatorStakingPage() && isLargeDesktop && <ChatSidePanel />} */}
    </Layout>
  </Layout>
}

export default Navigation
