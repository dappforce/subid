import clsx from 'clsx'
import { ComponentProps, useEffect } from 'react'
import grill from '@subsocial/grill-widget'
import { useSendEvent } from '../providers/AnalyticContext'

export type ChatIframeProps = ComponentProps<'div'> & {
  onUnreadCountChange?: (count: number) => void
}

export default function ChatIframe ({ onUnreadCountChange, ...props }: ChatIframeProps) {
  const sendEvent = useSendEvent()

  useEffect(() => {
    const listener = onUnreadCountChange ? ((count: number) => {
      console.log('unread count', count)
      onUnreadCountChange(count)
    }) : undefined
    if (listener) {
      grill.addUnreadCountListener(listener)
    }
    grill.init({
      hub: { id: 'polka' },
      channel: {
        id: '754',
        type: 'channel',
        settings: {
          enableInputAutofocus: true,
          enableBackButton: false,
          enableLoginButton: true
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