import { useState } from 'react'
import Button from '../tailwind-components/Button'
import StakeModal from './modals/StakeModal'

type StakeButtonProps = {
  isStake: boolean
}

const StakeButton = ({ isStake }: StakeButtonProps) => {
  const [ open, setOpen ] = useState(false)
  const label = !isStake ? 'Increase Stake' : 'Stake'

  return (
    <>
      <Button
        onClick={() => setOpen(true)} 
        variant='primaryOutline' 
        className='w-full' 
        size='sm'
      >
        {label}
      </Button>
      <StakeModal open={open} closeModal={() => setOpen(false)} />
    </>
  )
}

export default StakeButton
