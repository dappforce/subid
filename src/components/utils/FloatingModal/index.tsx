import React, { useEffect, useRef } from 'react'
import styles from './FloatingModal.module.sass'
import { Button } from 'antd'
import { HiChevronDown } from 'react-icons/hi2'
import clsx from 'clsx'
import { createPortal } from 'react-dom'

type FloatingModalProps = {
  position?: 'right' | 'bottom'
  open: boolean
  setOpen: (open: boolean) => void
  className?: string
  children: React.ReactNode
}

export default function FloatingModal ({
  position = 'bottom',
  open,
  setOpen,
  children,
  className
}: FloatingModalProps) {
  useEffect(() => {
    const close = (e: any) => {
      if (e.keyCode === 27) {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', close)

    return () => window.removeEventListener('keydown', close)
  }, [])

  useEffect(() => {
    if (open) {
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.documentElement.style.overflow = 'visible'
    }
  }, [ open ])

  const hasOpened = useRef(false)
  const toggleChat = () => {
    const nextStateOpen = !open

    setOpen(nextStateOpen)

    hasOpened.current = true
  }

  return (
    <>
      {createPortal(
        <div className={clsx(styles[`Position--${position}`])}>
          <div
            className={clsx(
              styles.ChatContainer,
              !open && styles.ChatContainerHidden,
            )}
          >
            <div
              className={clsx(styles.ChatOverlay)}
              onClick={() => {
                setOpen(false)
              }}
            />
            <div className={clsx(styles.ChatContent, className)}>
              <div className={clsx(styles.ChatControl)}>
                <Button onClick={toggleChat}>
                  <HiChevronDown />
                </Button>
              </div>
              {children}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
