import clsx from 'clsx'
import { ComponentProps, useEffect } from 'react'
import grill from '@subsocial/grill-widget'
import { useSendEvent } from '../providers/AnalyticContext'
import useWrapInRef from '../../hooks/useWrapInRef'

export type ChatIframeProps = ComponentProps<'div'> & {
  onUnreadCountChange?: (count: number) => void
}

export default function ChatIframe ({ onUnreadCountChange, ...props }: ChatIframeProps) {
  const sendEvent = useSendEvent()
  const sendEventRef = useWrapInRef(sendEvent)

  useEffect(() => {
    const listener = onUnreadCountChange ? ((count: number) => {
      onUnreadCountChange(count)
    }) : undefined
    if (listener) {
      grill.addUnreadCountListener(listener)
    }
    grill.init({
      hub: { id: 'polka' },
      rootFontSize: '1rem',
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
          sendEventRef.current('chat_widget_error')
        }
        iframe.onmouseenter = () => {
          sendEventRef.current('chat_widget_mouse_enter')
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