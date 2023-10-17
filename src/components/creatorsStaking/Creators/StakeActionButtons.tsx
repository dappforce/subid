import { useStakingConsts } from 'src/rtk/features/creatorStaking/stakingConsts/stakingConstsHooks'
import Button from '../tailwind-components/Button'
import { StakingModalVariant } from './modals/StakeModal'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { useBackerInfo } from 'src/rtk/features/creatorStaking/backerInfo/backerInfoHooks'
import { Tooltip } from 'antd'
import clsx from 'clsx'

type StakeButtonProps = {
  spaceId: string
  isStake: boolean
  buttonsSize?: 'sm' | 'lg' | 'md'
  openModal: () => void
  setModalVariant: (variant: StakingModalVariant) => void
  onClick?: () => void
  className?: string
}

const StakeActionButtons = ({
  spaceId,
  isStake,
  buttonsSize = 'sm',
  openModal,
  setModalVariant,
  onClick,
  className,
}: StakeButtonProps) => {
  const myAddress = useMyAddress()
  const stakingConsts = useStakingConsts()
  const backerInfo = useBackerInfo(spaceId, myAddress || '')

  const { info } = backerInfo || {}

  const { stakes } = info || {}

  const { maxEraStakeValues } = stakingConsts || {}

  const label = !isStake && myAddress ? 'Increase Stake' : 'Stake'

  const onButtonClick = (modalVariant: StakingModalVariant) => {
    onClick?.()
    setModalVariant(modalVariant)
    openModal()
  }

  const disableButtons =
    !myAddress ||
    !maxEraStakeValues ||
    !stakes ||
    stakes.length >= parseInt(maxEraStakeValues) - 1

  const buttons = (
    <div className='flex gap-4 md:flex-row flex-col'>
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
        <Button
          variant='outlined'
          className={clsx('w-full', className)}
          size={buttonsSize}
          onClick={() => onButtonClick('unstake')}
          disabled={disableButtons}
        >
          Unstake
        </Button>
      )}
    </div>
  )

  const tooltipText = !myAddress ? 'Connect your wallet' : 'Claim your rewards first'

  return disableButtons ? (
    <Tooltip title={tooltipText}>
      {buttons}
    </Tooltip>
  ) : (
    buttons
  )
}

export default StakeActionButtons
