import { createContext, useContext, useState } from 'react'

export type StakingContextState = {
  amount: string
  setAmount: (amount: string) => void
  stakedSpaceId: string | undefined
  setStakedSpaceId: (spaceId: string) => void
  showSuccessModal: boolean
  setShowSuccessModal: (showSuccessModal: boolean) => void
}

const ModalContext = createContext<StakingContextState>({} as any)

export const ModalContextWrapper: React.FC = ({
  children,
}) => {
  const [ amount, setAmount ] = useState('')
  const [ stakedSpaceId, setStakedSpaceId ] = useState<string | undefined>()
  const [ showSuccessModal, setShowSuccessModal ] = useState<boolean>(false)

  const value = {
    amount,
    setAmount,
    stakedSpaceId,
    setStakedSpaceId,
    showSuccessModal,
    setShowSuccessModal,
  }

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  )
}

export const useModalContext = () => useContext(ModalContext)
