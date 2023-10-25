import { createContext, useContext, useState } from 'react'
import { ResourceMetadata } from '../chat/types'

export type ChatContextState = {
  spaceId?: string
  setSpaceId: (spaceId?: string) => void
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  metadata?: ResourceMetadata
  setMetadata: React.Dispatch<React.SetStateAction<ResourceMetadata | undefined>>
}

const ChatContextContext = createContext<ChatContextState>({} as any)

export const ChatContextWrapper: React.FC = ({
  children,
}) => {
  const [ open, setOpen ] = useState<boolean>(false)
  const [ spaceId, setSpaceId ] = useState<string>() 
  const [ metadata, setMetadata ] = useState<ResourceMetadata>()

  const value = {
    spaceId,
    setSpaceId,
    open,
    setOpen,
    metadata,
    setMetadata,
  }

  return (
    <ChatContextContext.Provider value={value}>
      {children}
    </ChatContextContext.Provider>
  )
}

export const useChatContext = () => useContext(ChatContextContext)
