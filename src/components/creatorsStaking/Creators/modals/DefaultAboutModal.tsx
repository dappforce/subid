import { useEffect, useState } from 'react'
import AboutModal from './AboutModal'
import { useBackerInfo } from '@/rtk/features/creatorStaking/backerInfo/backerInfoHooks'
import { useMyAddress } from '@/components/providers/MyExtensionAccountsContext'
import { useModalContext } from '../../contexts/ModalContext'

type DefaultAboutModalProps = {
  defaultSpaceId?: string
}

const DefaultAboutModal = ({ defaultSpaceId }: DefaultAboutModalProps) => {
  const myAddress = useMyAddress()
  const { amount, setAmount } = useModalContext()
  const [ openDefaultAboutModal, setOpenDefaultAboutModal ] = useState(false)

  const backerInfo = useBackerInfo(defaultSpaceId, myAddress)
  
  const { info } = backerInfo || {}
  
  // const { backersCount, totalStaked: total } = eraStakeInfo || {}
  const { totalStaked } = info || {}
  
  const isStake = totalStaked === '0'
  
  useEffect(() => {
    if (defaultSpaceId) {
      setOpenDefaultAboutModal(true)
    }
  }, [])

  if(!defaultSpaceId) return null

  return (
    <AboutModal
      open={openDefaultAboutModal}
      closeModal={() => setOpenDefaultAboutModal(false)}
      spaceId={defaultSpaceId}
      isStake={isStake}
      amount={amount}
      setAmount={setAmount}
    />
  )
}

export default DefaultAboutModal
