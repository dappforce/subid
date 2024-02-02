import Table, { Column } from '../tailwind-components/Table'
import { SubDate } from '@subsocial/utils'
import { useGeneralEraInfo } from 'src/rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import BN from 'bignumber.js'
import { useStakingContext } from 'src/components/staking/collators/StakingContext'
import { BIGNUMBER_ZERO } from 'src/config/app/consts'
import { useGetNextEraTime } from '../hooks/useGetNextEraTime'
import { useResponsiveSize } from 'src/components/responsive'
import { AiOutlineCheckCircle } from 'react-icons/ai'
import { BiTimeFive } from 'react-icons/bi'
import clsx from 'clsx'

type TimeRemainingProps = {
  unlockEra: string
  className?: string
}

export const TimeRemaining = ({ unlockEra, className }: TimeRemainingProps) => {
  const eraInfo = useGeneralEraInfo()
  const { currentBlockNumber } = useStakingContext()
  const { currentEra, blockPerEra, nextEraBlock } = eraInfo?.info || {}

  const blocksToNextEra = new BN(nextEraBlock || '0').minus(
    new BN(currentBlockNumber || '0')
  )

  const erasToUnlock = new BN(unlockEra || '0')
    .minus(new BN(1))
    .minus(new BN(currentEra || '0'))

  const blocksToUnlock = erasToUnlock
    .multipliedBy(new BN(blockPerEra || '0'))
    .plus(blocksToNextEra)

  const unlockBlockNumber = blocksToUnlock
    .plus(currentBlockNumber || BIGNUMBER_ZERO)
    .toString()

  const time = useGetNextEraTime(unlockBlockNumber)

  if (!currentEra || !blockPerEra) return <>-</>

  const isNotAvailable = new BN(unlockEra).gt(new BN(currentEra))

  return (
    <div className={clsx('flex items-center justify-end gap-2', className)}>
      {isNotAvailable ? (
        <>
          {SubDate.formatDate(time.toNumber()).replace('in', '')}{' '}
          <BiTimeFive className='text-text-muted' size={20} />
        </>
      ) : (
        <>
          Available{' '}
          <AiOutlineCheckCircle className='text-text-success' size={20} />
        </>
      )}
    </div>
  )
}

type UnstakingTableProps = {
  data: {
    batch: number
    unstakingAmount: JSX.Element
    timeRemaining: JSX.Element
  }[]
}

const UnstakingTable = ({ data }: UnstakingTableProps) => {
  const { isMobile } = useResponsiveSize()

  const columns: Column[] = [
    {
      index: 'batch',
      name: 'Batch',
    },
    {
      index: 'unstakingAmount',
      name: 'Unstaking Amount',
      align: 'right',
    },
  ]

  if (!isMobile) {
    columns.push({
      index: 'timeRemaining',
      name: 'Time Remaining',
      align: 'right',
    })
  }

  return <Table columns={columns} data={data} />
}

export default UnstakingTable
