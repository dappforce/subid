import { useStakingConsts } from 'src/rtk/features/creatorStaking/stakingConsts/stakingConstsHooks'
import Button from '../tailwind-components/Button'
import { StakingModalVariant } from './modals/StakeModal'
import {
  useIsMulti,
  useMyAddress,
} from 'src/components/providers/MyExtensionAccountsContext'
import { useBackerInfo } from 'src/rtk/features/creatorStaking/backerInfo/backerInfoHooks'
import { Tooltip } from 'antd'
import clsx from 'clsx'
import HowToSelectAccountModal from './modals/HowToSelectAccountModal'
import { useState } from 'react'
import StakeActionButtonsMenu from './StakeActionButtonsMenu'

type StakeButtonProps = {
  spaceId: string
  isStake: boolean
  buttonsSize?: 'sm' | 'lg' | 'md'
  openStakeModal: () => void
  openMoveStakeModal: () => void
  setModalVariant: (variant: StakingModalVariant) => void
  onClick?: () => void
  className?: string
}

const StakeActionButtons = ({
  spaceId,
  isStake,
  buttonsSize = 'sm',
  openStakeModal,
  setModalVariant,
  onClick,
  className,
  openMoveStakeModal,
}: StakeButtonProps) => {
  const myAddress = useMyAddress()
  const stakingConsts = useStakingConsts()
  const backerInfo = useBackerInfo(spaceId, myAddress || '')
  const isMulti = useIsMulti()

  const [ openMultiAccountModal, setOpenMultiAccountModal ] = useState(false)

  const { info } = backerInfo || {}

  const { stakes } = info || {}

  const { maxEraStakeValues } = stakingConsts || {}

  const label = !isStake && myAddress ? 'Increase Stake' : 'Stake'

  const onButtonClick = (modalVariant: StakingModalVariant) => {
    onClick?.()
    setModalVariant(modalVariant)
    openStakeModal()
  }

  const onOpenMoveStakeModal = () => {
    onClick?.()
    openMoveStakeModal()
  }

  const disableButtons =
    !myAddress ||
    !maxEraStakeValues ||
    !stakes ||
    stakes.length >= parseInt(maxEraStakeValues) - 1

  const buttons = (
    <div className='flex gap-4'>
      <Button
        onClick={() => onButtonClick(isStake ? 'stake' : 'increaseStake')}
        variant='primaryOutline'
        className={clsx('w-full', className)}
        size={buttonsSize}
        disabled={disableButtons}
      >
        {label}
      </Button>
      {!isStake && myAddress && (
        <StakeActionButtonsMenu
          panelSize='xs'
          panelClassName='!w-32'
          itemClassName='my-[2px]'
          openUnstakeModal={() => onButtonClick('unstake')}
          disabled={disableButtons}
          openMoveStakeModal={() => {
            onOpenMoveStakeModal()
          }}
          buttonsSize={buttonsSize}
        />
      )}
    </div>
  )

  const multiAccountButton = (
    <div>
      <Button
        variant='primaryOutline'
        className={clsx('w-full', className)}
        size={buttonsSize}
        onClick={() => setOpenMultiAccountModal(true)}
      >
        Stake
      </Button>

      <HowToSelectAccountModal
        open={openMultiAccountModal}
        closeModal={() => setOpenMultiAccountModal(false)}
      />
    </div>
  )

  const tooltipText = !myAddress
    ? 'Connect your wallet'
    : 'Claim your rewards first'

  const actionButtons = disableButtons ? (
    <Tooltip title={tooltipText}>{buttons}</Tooltip>
  ) : (
    buttons
  )

  return isMulti ? multiAccountButton : actionButtons
}

export default StakeActionButtons
