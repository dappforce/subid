import clsx from 'clsx'
import { ComponentProps, useEffect } from 'react'
import grill from '@subsocial/grill-widget'
import { useSendEvent } from '../providers/AnalyticContext'

export type ChatIframeProps = ComponentProps<'div'> & {
  setUnreadCount?: (count: number) => void
}

export default function ChatIframe ({ setUnreadCount, ...props }: ChatIframeProps) {
  const sendEvent = useSendEvent()

  useEffect(() => {
    const listener = setUnreadCount ? ((count: number) => setUnreadCount(count)) : undefined
    if (listener) {
      grill.addUnreadCountListener(listener)
    }
    grill.init({
      hub: { id: '1025' },
      rootFontSize: '0.875rem',
      channel: {
        id: '7120',
        type: 'channel',
        settings: {
          enableInputAutofocus: true,
          enableBackButton: false,
        }
      },
      theme: 'light',
      onWidgetCreated: (iframe) => {
        iframe.onerror = () => {
          sendEvent('chat_widget_error')
        }
        iframe.onmouseenter = () => {
          sendEvent('chat_widget_mouse_enter')
        }
        return iframe
      }
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