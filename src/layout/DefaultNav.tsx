import { useSidebarCollapsed } from '@/components/providers/SideBarCollapsedContext'
import { Drawer } from 'antd'
import clsx from 'clsx'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { FunctionComponent, useEffect } from 'react'

const Menu = dynamic(() => import('./SideMenu'), { ssr: false })

const DefaultNav: FunctionComponent<{ className?: string }> = ({
  className,
}) => {
  const {
    state: { collapsed },
    hide,
  } = useSidebarCollapsed()
  const { asPath } = useRouter()

  useEffect(() => hide(), [ asPath ])

  return (
    <Drawer
      className={clsx('DfSideBar h-100', className)}
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
  )
}

export default DefaultNav