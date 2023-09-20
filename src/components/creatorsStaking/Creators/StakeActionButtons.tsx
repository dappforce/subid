import { useStakingConsts } from 'src/rtk/features/creatorStaking/stakingConsts/stakingConstsHooks'
import Button from '../tailwind-components/Button'
import { StakingModalVariant } from './modals/StakeModal'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { useStakerInfo } from 'src/rtk/features/creatorStaking/stakerInfo/stakerInfoHooks'
import { Tooltip } from 'antd'

type StakeButtonProps = {
  spaceId: string
  isStake: boolean
  buttonsSize?: 'sm' | 'lg' | 'md'
  openModal: () => void
  setModalVariant: (variant: StakingModalVariant) => void
  onClick?: () => void
}

const StakeActionButtons = ({
  spaceId,
  isStake,
  buttonsSize = 'sm',
  openModal,
  setModalVariant,
  onClick,
}: StakeButtonProps) => {
  const myAddress = useMyAddress()
  const stakingConsts = useStakingConsts()
  const stakerInfo = useStakerInfo(spaceId, myAddress || '')

  const { info } = stakerInfo || {}

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
        className='w-full'
        size={buttonsSize}
        disabled={disableButtons}
      >
        {label}
      </Button>
      {!isStake && myAddress && (
        <Button
          variant='outlined'
          className='w-full'
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
