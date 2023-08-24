import Button from '../tailwind-components/Button'
import { StakingModalVariant } from './modals/StakeModal'

type StakeButtonProps = {
  isStake: boolean
  buttonsSize?: 'sm' | 'lg' | 'md'
  openModal: () => void
  setModalVariant: (variant: StakingModalVariant) => void
  onClick?: () => void
}

const StakeActionButtons = ({ 
  isStake, 
  buttonsSize = 'sm', 
  openModal,
  setModalVariant,
  onClick
}: StakeButtonProps) => {

  const label = !isStake ? 'Increase Stake' : 'Stake'

  const onButtonClick = (modalVariant: StakingModalVariant) => {
    onClick?.()
    setModalVariant(modalVariant)
    openModal()
  }

  return (
    <>
      <div className='flex gap-4'>
        <Button
          onClick={() => onButtonClick(isStake ? 'stake' : 'increaseStake')}
          variant='primaryOutline'
          className='w-full'
          size={buttonsSize}
        >
          {label}
        </Button>
        {!isStake && (
          <Button
            variant='outlined'
            className='w-full'
            size={buttonsSize}
            onClick={() => onButtonClick('unstake')}
          >
            Unstake
          </Button>
        )}
      </div>
    </>
  )
}

export default StakeActionButtons
