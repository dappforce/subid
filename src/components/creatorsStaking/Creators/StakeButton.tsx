import { useState } from 'react'
import Button from '../tailwind-components/Button'
import StakingModal, { StakingModalVariant } from './modals/StakeModal'

type StakeButtonProps = {
  isStake: boolean
  spaceId: string
  buttonsSize?: 'sm' | 'lg' | 'md'
  onClick?: () => void
}

const StakeActionButtons = ({ 
  isStake, 
  spaceId, 
  buttonsSize = 'sm', 
  onClick 
}: StakeButtonProps) => {
  const [ open, setOpen ] = useState(false)
  const [ modalVariant, setModalVariant ] = useState<StakingModalVariant>('stake')

  const label = !isStake ? 'Increase Stake' : 'Stake'

  const onButtonClick = (modalVariant: StakingModalVariant) => {
    onClick?.()
    setModalVariant(modalVariant)
    setOpen(true)
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
      <StakingModal
        open={open}
        closeModal={() => setOpen(false)}
        spaceId={spaceId}
        modalVariant={modalVariant}
      />
    </>
  )
}

export default StakeActionButtons
