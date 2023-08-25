import Table, { Column } from '../tailwind-components/Table'
import { useStakerLedger } from 'src/rtk/features/creatorStaking/stakerLedger/stakerLedgerHooks'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { useMemo } from 'react'
import {
  useGetDecimalsAndSymbolByNetwork,
  NextEraStartDate,
  useGetNextEraTime,
} from '../utils/index'
import { FormatBalance } from 'src/components/common/balances'
import { SubDate } from '@subsocial/utils'
import { useGeneralEraInfo } from 'src/rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import BN from 'bignumber.js'
import { useStakingContext } from 'src/components/staking/collators/StakingContext'
import { BIGNUMBER_ZERO } from 'src/config/app/consts'

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
  {
    index: 'timeRemaining',
    name: 'Time Remaining',
    align: 'right',
  },
]

type TimeRemainingProps = {
  unlockEra: string
}

const TimeRemaining = ({ unlockEra }: TimeRemainingProps) => {
  const eraInfo = useGeneralEraInfo()
  const { currentBlockNumber } = useStakingContext()
  const { currentEra, blockPerEra, nextEraBlock } = eraInfo || {}
  
  const blocksToNextEra = new BN(nextEraBlock || '0').minus(
    new BN(currentBlockNumber || '0')
  )

  const erasToUnlock = new BN(unlockEra || '0').minus(new BN(1)).minus(new BN(currentEra || '0'))

  const blocksToUnlock = (erasToUnlock.multipliedBy(new BN(blockPerEra || '0'))).plus(blocksToNextEra)
  
  const unlockBlockNumber = blocksToUnlock
    .plus(currentBlockNumber || BIGNUMBER_ZERO)
    .toString()

  const time = useGetNextEraTime(unlockBlockNumber)

  if (!currentEra || !blockPerEra) return <>-</>

  const isNotAvailable = new BN(unlockEra).gt(new BN(currentEra))

  return (
    <>{isNotAvailable ? SubDate.formatDate(time.toNumber()) : 'Available'}</>
  )
}

const Unstaking = () => {
  const myAddress = useMyAddress()
  const { decimal, tokenSymbol } = useGetDecimalsAndSymbolByNetwork('subsocial')

  const stakerLedger = useStakerLedger(myAddress)

  const { ledger, loading } = stakerLedger || {}

  const data = useMemo(() => {
    if (!ledger) {
      return []
    }

    return ledger.unbondingInfo.unlockingChunks.map((item, i) => {
      const amount = (
        <FormatBalance
          value={item.amount}
          decimals={decimal}
          currency={tokenSymbol}
          isGrayDecimal={false}
        />
      )

      return {
        batch: i + 1,
        unstakingAmount: amount,
        timeRemaining: <TimeRemaining unlockEra={item.unlockEra} />,
      }
    })
  }, [!!ledger, loading])

  return (
    <>
      <Table columns={columns} data={data} />
    </>
  )
}

export default Unstaking
