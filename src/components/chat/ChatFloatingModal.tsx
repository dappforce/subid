import React, { useState, useEffect, useRef } from 'react'
import styles from './ChatFloatingModal.module.sass'
import { Button } from 'antd'
import { HiChevronDown } from 'react-icons/hi2'
import ChatIframe from './ChatIframe'
import clsx from 'clsx'
import { createPortal } from 'react-dom'
import { useSendEvent } from '../providers/AnalyticContext'
import { isCreatorStakingPage } from '../utils'
import { useChatContext } from '../providers/ChatContext'
import { useResponsiveSize } from '../responsive'

const storageName = 'grill:unreadCount'

type ChatFloatingModalProps = {
  position?: 'right' | 'bottom'
}

export default function ChatFloatingModal ({
  position = 'bottom',
}: ChatFloatingModalProps) {
  const sendEvent = useSendEvent()
  const { open, setOpen, setSpaceId, setMetadata } = useChatContext()
  const { isLargeDesktop } = useResponsiveSize()

  const [ unreadCount, setUnreadCount ] = useState(0)

  useEffect(() => {
    const unreadCountFromStorage = parseInt(localStorage.getItem(storageName) ?? '')
    if (unreadCountFromStorage && !isNaN(unreadCountFromStorage)) {
      setUnreadCount(unreadCountFromStorage)
    }

    const close = (e: any) => {
      if (e.keyCode === 27) {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', close)

    return () => window.removeEventListener('keydown', close)
  }, [])

  useEffect(() => {
    if(open) {
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.documentElement.style.overflow = 'auto'
    }
  }, [ open ])

  const hasOpened = useRef(false)
  const toggleChat = () => {
    let event
    if (open) event = 'close_grill_iframe'
    else {
      event = 'open_grill_iframe'
      setUnreadCount(0)
      localStorage.setItem(storageName, '0')
    }
    sendEvent(event)

    const nextStateOpen = !open
    
    setOpen(nextStateOpen)

    hasOpened.current = true
  }

  if (isLargeDesktop && !isCreatorStakingPage()) {
    return null
  }

  const onUnreadCountChange = (count: number) => {
    if (count > 0) {
      setUnreadCount(count)
      localStorage.setItem(storageName, count.toString())
    }
  }

  return (
    <>
      {createPortal(
        <div className={clsx(styles[`Position--${position}`])}>
          <div
            className={clsx(
              styles.ChatContainer,
              !open && styles.ChatContainerHidden
            )}
          >
            <div
              className={clsx(styles.ChatOverlay)}
              onClick={() => {
                setOpen(false)
              }}
            />
            <div className={clsx(styles.ChatContent)}>
              <div className={clsx(styles.ChatControl)}>
                <Button onClick={toggleChat}>
                  <HiChevronDown />
                </Button>
              </div>
              <ChatIframe
                onUnreadCountChange={onUnreadCountChange}
                className={styles.ChatIframe}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
      {createPortal(
        <div className={styles.ChatFloatingWrapper}>
          <Button className={styles.ChatFloatingButton} onClick={() => {
            setSpaceId(undefined)
            setMetadata(undefined)
            toggleChat()
          }}>
            <img src='/images/grillchat-white.svg' alt='GrillChat' />
            <span>{isCreatorStakingPage()
                ? 'Creator Chats'
                : 'Polkadot Chat'
            }</span>
          </Button>
          {!!unreadCount && (
            <span className={styles.ChatUnreadCount}>{unreadCount}</span>
          )}
        </div>,
        document.body
      )}
    </>
  )
}
