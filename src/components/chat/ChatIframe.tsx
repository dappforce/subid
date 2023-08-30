import clsx from 'clsx'
import { ComponentProps, useEffect } from 'react'
import grill from '@subsocial/grill-widget'

export type ChatIframeProps = ComponentProps<'div'> & {
  setUnreadCount?: (count: number) => void
}

export default function ChatIframe ({ setUnreadCount, ...props }: ChatIframeProps) {
  useEffect(() => {
    const listener = setUnreadCount ? ((count: number) => setUnreadCount(count)) : undefined
    if (listener) {
      grill.addUnreadCountListener(listener)
    }
    grill.init({
      hub: { id: '1025' },
      channel: {
        id: '7120',
        type: 'channel',
        settings: {
          enableInputAutofocus: true,
          enableBackButton: false,
          enableLoginButton: false
        }
      },
      theme: 'light'
    })

    return () => {
      if (listener) grill.removeUnreadCountListener(listener)
    }
  }, [])

  return (
    <div
      {...props}
      id='grill'
      className={clsx(props.className)}
    />
  )
}