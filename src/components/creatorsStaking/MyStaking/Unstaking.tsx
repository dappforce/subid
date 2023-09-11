import Table, { Column } from '../tailwind-components/Table'
import { useStakerLedger } from 'src/rtk/features/creatorStaking/stakerLedger/stakerLedgerHooks'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { useMemo } from 'react'
import { FormatBalance } from 'src/components/common/balances'
import { SubDate } from '@subsocial/utils'
import { useGeneralEraInfo } from 'src/rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import BN from 'bignumber.js'
import { useStakingContext } from 'src/components/staking/collators/StakingContext'
import { BIGNUMBER_ZERO } from 'src/config/app/consts'
import { useGetDecimalsAndSymbolByNetwork } from 'src/components/utils/useGetDecimalsAndSymbolByNetwork'
import { useGetNextEraTime } from '../hooks/useGetNextEraTime'
import { useResponsiveSize } from 'src/components/responsive'

type TimeRemainingProps = {
  unlockEra: string
  className?: string
}

const TimeRemaining = ({ unlockEra, className }: TimeRemainingProps) => {
  const eraInfo = useGeneralEraInfo()
  const { currentBlockNumber } = useStakingContext()
  const { currentEra, blockPerEra, nextEraBlock } = eraInfo || {}

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
    <div className={className}>
      {isNotAvailable
        ? SubDate.formatDate(time.toNumber()).replace('in', '')
        : 'Available'}
    </div>
  )
}

const Unstaking = () => {
  const myAddress = useMyAddress()
  const { decimal, tokenSymbol } = useGetDecimalsAndSymbolByNetwork('subsocial')
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

      const unstakingAmount = isMobile ? (
        <div>
          <div>{amount}</div>
          <TimeRemaining className='text-sm text-text-muted' unlockEra={item.unlockEra} />
        </div>
      ) : (
        amount
      )

      return {
        batch: i + 1,
        unstakingAmount,
        timeRemaining: <TimeRemaining unlockEra={item.unlockEra} />,
      }
    })
  }, [!!ledger, loading, isMobile])

  return (
    <>
      <Table columns={columns} data={data} />
    </>
  )
}

export default Unstaking
