import Unstaking from './Unstaking'
import WithdrawTxButton from './WithdrawTxButton'

const UnstakingSection = () => {
  return (
    <div className='flex flex-col gap-4 p-6 bg-white rounded-[20px]'>
      <div className='flex justify-between items-center gap-4'>
        <div className='font-semibold text-2xl leading-[26px]'>
          Unlocking your SUB tokens
        </div>
        <WithdrawTxButton />
      </div>
      <Unstaking />
    </div>
  )
}

export default UnstakingSection
