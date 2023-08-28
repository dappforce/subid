import clsx from 'clsx'
import { ComponentProps, useEffect } from 'react'
import grill from '@subsocial/grill-widget'

export type ChatIframeProps = ComponentProps<'div'>

export default function ChatIframe ({ ...props }: ChatIframeProps) {
  useEffect(() => {
    grill.init({
      hub: { id: 'polka' },
      channel: {
        id: '754',
        type: 'channel',
        settings: {
          enableInputAutofocus: true,
          enableBackButton: false,
          enableLoginButton: false
        }
      },
      theme: 'light'
    })
  }, [])

  return (
    <div
      {...props}
      id='grill'
      className={clsx(props.className)}
    />
  )
}