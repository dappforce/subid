import { useEffect, useState } from 'react'
import AboutModal from './AboutModal'
import { useBackerInfo } from '@/rtk/features/creatorStaking/backerInfo/backerInfoHooks'
import { useMyAddress } from '@/components/providers/MyExtensionAccountsContext'
import { useModalContext } from '../../contexts/ModalContext'
import { useCreatorsList } from '@/rtk/features/creatorStaking/creatorsList/creatorsListHooks'
import { useRouter } from 'next/router'
import { useSendEvent } from '@/components/providers/AnalyticContext'

type DefaultAboutModalProps = {
  defaultSpaceId?: string
}

const DefaultAboutModal = ({ defaultSpaceId }: DefaultAboutModalProps) => {
  const myAddress = useMyAddress()
  const { amount, setAmount } = useModalContext()
  const [ openDefaultAboutModal, setOpenDefaultAboutModal ] = useState(false)
  const creatorsList = useCreatorsList()
  const router = useRouter() 
  const sendEvent = useSendEvent() 

  const creatorsSpaceIds = creatorsList?.map(({ id }) => id)

  const isCreator =
    defaultSpaceId && creatorsSpaceIds?.includes(defaultSpaceId?.toString())

  const backerInfo = useBackerInfo(defaultSpaceId, myAddress)

  const { info } = backerInfo || {}

  const { totalStaked } = info || {}

  const isStake = totalStaked === '0'

  useEffect(() => {
    if (defaultSpaceId && isCreator) {
      setOpenDefaultAboutModal(true)
      sendEvent('cs_about_modal_opened', { value: defaultSpaceId })
    }

    if (defaultSpaceId && !isCreator) {
      const query = router.query  

      if(query.creator) {
        router.replace('/creators')
      }
    }
  }, [ creatorsSpaceIds?.join(',') ])

  if (!defaultSpaceId || !isCreator) return null

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
