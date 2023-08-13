import { Tab } from '@headlessui/react'
import { ComponentProps, Fragment, ReactNode, useEffect, useState } from 'react'
import Container from './Container'
import clsx from 'clsx'

type Tab = {
  id: string
  text: string
  content: (changeTab: (selectedTab: number) => void) => JSX.Element
}
export type TabsProps = ComponentProps<'div'> & {
  asContainer?: boolean
  tabs: Tab[]
  tabsRightElement?: ReactNode
  panelClassName?: string
  defaultTab?: number
  withDivider?: boolean
  withHashIntegration?: boolean
  hideBeforeHashLoaded?: boolean
  manualTabControl?: {
    selectedTab: number
    setSelectedTab: (selectedTab: number) => void
  }
}

export default function Tabs ({
  asContainer,
  tabs,
  panelClassName,
  tabsRightElement,
  defaultTab = 0,
  withDivider = false,
  hideBeforeHashLoaded,
  withHashIntegration = true,
  manualTabControl,
  ...props
}: TabsProps) {
  const [ selectedIndex, setSelectedIndex ] = useState(defaultTab)
  const selectedTab = manualTabControl?.selectedTab ?? selectedIndex
  const setSelectedTab = manualTabControl?.setSelectedTab ?? setSelectedIndex

  const [ isHashLoaded, setIsHashLoaded ] = useState(false)

  useEffect(() => {
    if (!withHashIntegration) return

    const hash = window.location.hash
    const index = tabs.findIndex(({ id }) => `#${id}` === hash)
    if (index > -1) setSelectedTab(index)

    setIsHashLoaded(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const changeTab = (index: number) => {
    setSelectedTab(index)
  }

  const component = asContainer ? Container : 'div'
  const usedSelectedTab =
    !hideBeforeHashLoaded || !withHashIntegration || isHashLoaded
      ? selectedTab
      : -1

  return (
    <Tab.Group
      selectedIndex={usedSelectedTab === -1 ? tabs.length : usedSelectedTab}
      onChange={setSelectedTab}
    >
      <Tab.List
        as={component}
        className={clsx('flex items-end gap-6', props.className)}
      >
        {tabs.map(({ text, id }) => (
          <Tab key={id} as={Fragment}>
            {({ selected }) => (
              <span
                className={clsx(
                  'group relative block cursor-pointer rounded-t-2xl',
                  'outline-none after:absolute after:bottom-0 after:left-0 after:h-[90%]',
                  'after:w-full after:opacity-0 after:transition-opacity',
                  'focus-visible:after:opacity-100'
                )}
              >
                <span
                  className={clsx(
                    'relative z-10 block py-2 leading-normal text-text-muted transition-colors',
                    'after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full',
                    'after:origin-bottom after:scale-y-0 after:bg-text-primary after:opacity-0 after:transition',
                    'group-hover:text-text-primary after:mt-[2px] group-hover:after:scale-y-100 group-hover:after:opacity-100',
                    selected &&
                      'text-text-primary after:scale-y-100 after:opacity-100'
                  )}
                >
                  {text}
                </span>
              </span>
            )}
          </Tab>
        ))}
        {usedSelectedTab === -1 && <Tab key='empty' />}
        {tabsRightElement}
      </Tab.List>
      {withDivider && <div className='w-full border border-[#D4E2EF]'></div>}
      <Tab.Panels as={component} className={clsx(panelClassName)}>
        {tabs.map(({ id, content }) => (
          <Tab.Panel key={id}>{content(changeTab)}</Tab.Panel>
        ))}
        {usedSelectedTab === -1 && <Tab.Panel key='empty' />}
      </Tab.Panels>
    </Tab.Group>
  )
}
