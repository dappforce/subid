import { useEffect, useState } from 'react'
import AboutModal from './AboutModal'
import { useBackerInfo } from '@/rtk/features/creatorStaking/backerInfo/backerInfoHooks'
import { useMyAddress } from '@/components/providers/MyExtensionAccountsContext'
import { useModalContext } from '../../contexts/ModalContext'
import { useCreatorsList } from '@/rtk/features/creatorStaking/creatorsList/creatorsListHooks'
import useRedirectToCreatorsPage from '../../hooks/useRedirectToCreatorsPage'

type DefaultAboutModalProps = {
  defaultSpaceId?: string
}

const DefaultAboutModal = ({ defaultSpaceId }: DefaultAboutModalProps) => {
  const myAddress = useMyAddress()
  const { amount, setAmount } = useModalContext()
  const [ openDefaultAboutModal, setOpenDefaultAboutModal ] = useState(false)
  const creatorsList = useCreatorsList()
  const redirectToCreatorsPage = useRedirectToCreatorsPage()

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
    }

    if (defaultSpaceId && !isCreator) {
      redirectToCreatorsPage()
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
