import React, { useEffect } from 'react'
import styles from './FloatingModal.module.sass'
import { Button } from 'antd'
import { HiChevronDown } from 'react-icons/hi2'
import clsx from 'clsx'
import { createPortal } from 'react-dom'

type FloatingModalProps = {
  position?: 'right' | 'bottom'
  open: boolean
  closeModal: () => void
  className?: string
  children: React.ReactNode
}

export default function FloatingModal ({
  position = 'bottom',
  open,
  closeModal,
  children,
  className
}: FloatingModalProps) {
  useEffect(() => {
    const close = (e: any) => {
      if (e.keyCode === 27) {
        closeModal()
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

  if(!open) return null

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
                closeModal()
              }}
            />
            <div className={clsx(styles.ChatContent, className)}>
              <div className={clsx(styles.ChatControl)}>
                <Button onClick={closeModal}>
                  <HiChevronDown />
                </Button>
              </div>
              {children}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
