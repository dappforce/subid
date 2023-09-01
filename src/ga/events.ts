import { event } from 'nextjs-google-analytics'
import { useIsSignedIn } from '../components/providers/MyExtensionAccountsContext'
import categories from './category'

type CreateEventProps = {
  category: string
  action: string
}

export const sendGaEvent = (props: CreateEventProps) => {
  event(props.action, {
    category: props.category
  })
}

export const sendGuestGaEvent = (action: string) => sendGaEvent({
  category: categories.user.guest,
  action
})

export const sendSignedInGaEvent = (action: string) => sendGaEvent({
  category: categories.user.signin,
  action
})

export const useSendGaUserEvent = () => {
  const isSignIn = useIsSignedIn()
  const sendGAEvent = isSignIn ? sendSignedInGaEvent : sendGuestGaEvent

  return sendGAEvent
}

export const useBuildSendGaUserEvent = (action: string) => {
  const sendGaEvent = useSendGaUserEvent()

  return () => sendGaEvent(action)
}