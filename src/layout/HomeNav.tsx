import Sider from 'antd/lib/layout/Sider'
import dynamic from 'next/dynamic'

const Menu = dynamic(() => import('./SideMenu'), { ssr: false })

const HomeNav = () => {
  return (
    <Sider
      className='DfSider'
      width='230'
      trigger={null}
      collapsible
      collapsed={true}
    >
      <Menu />
    </Sider>
  )
}

export default HomeNav