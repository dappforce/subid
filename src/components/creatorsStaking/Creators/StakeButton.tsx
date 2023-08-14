import Button from '../tailwind-components/Button'

type StakeButtonProps = {
  isStake: boolean
}

const StakeButton = ({ isStake }: StakeButtonProps) => {
  const label = !isStake ? 'Increase Stake' : 'Stake'

  return (
    <Button variant='primaryOutline' className='w-full' size='sm'>
      {label}
    </Button>
  )
}

export default StakeButton
