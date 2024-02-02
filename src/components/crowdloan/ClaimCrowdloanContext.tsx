import clsx from 'clsx'
import { createContext, useContext, useState } from 'react'
import { fullUrl } from '../utils'
import CustomModal, { CustomModalProps } from '../utils/CustomModal'
import TwitterMock from '../utils/TwitterMock'

type ClaimCrowdloanState = {
  loadingTx: boolean
  setLoadingTx: (loading: boolean) => void
  openModal: (claimedToken: string) => void
}

const ClaimCrowdloanContext = createContext<ClaimCrowdloanState>({
  loadingTx: false,
  openModal: () => undefined,
  setLoadingTx: () => undefined
})

export function ClaimCrowdloanProvider ({ children }: { children: any }) {
  const [ openModal, setOpenModal ] = useState(false)
  const [ loadingTx, setLoadingTx ] = useState(false)
  const [ claimedToken, setClaimedToken ] = useState('')

  const state = {
    loadingTx,
    setLoadingTx,
    openModal: (claimedToken: string) => {
      setOpenModal(true)
      setClaimedToken(claimedToken)
    }
  }

  const onCloseModal = () => {
    setOpenModal(false)
    setLoadingTx(false)
    setClaimedToken('')
  }

  return (
    <ClaimCrowdloanContext.Provider value={state}>
      {children}
      <SuccessClaimModal visible={openModal} onCancel={onCloseModal} claimedToken={claimedToken} />
    </ClaimCrowdloanContext.Provider>
  )
}

export function useClaimCrowdloanContext () {
  return useContext(ClaimCrowdloanContext)
}

function SuccessClaimModal ({ claimedToken, ...props }: CustomModalProps & { claimedToken: string }) {
  const twitterText = 'I just claimed my crowdloan rewards on @SubIDapp!\nYou can try it here:'

  return (
    <CustomModal
      centered
      title='🎉 Congratulations!'
      subtitle={`You successfully claimed ${claimedToken}`}
      className={clsx('bs-text-center')}
      {...props}
    >
      <div className='bs-mt-2'>
        <TwitterMock
          className='w-100'
          url='/'
          twitterText={twitterText}
          buttonText='Tweet about it!'
        >
          <p>
            I just claimed my crowdloan rewards on @SubIDapp!
            <br />
            You can try it here:
            <br />
            <a>{fullUrl('/')}</a>
          </p>
          <a>#SubID</a>
        </TwitterMock>
      </div>
    </CustomModal>
  )
}
