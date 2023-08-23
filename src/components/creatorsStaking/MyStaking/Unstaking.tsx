import Table, { Column } from '../tailwind-components/Table'
import { useStakerLedger } from 'src/rtk/features/creatorStaking/stakerLedger/stakerLedgerHooks'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { useMemo } from 'react'
import { useGetDecimalsAndSymbolByNetwork } from '../utils/index'
import { FormatBalance } from 'src/components/common/balances'

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
        timeRemaining: item.unlockEra,
      }
    })
  }, [ !!ledger, loading ])

  return (
    <>
      <Table columns={columns} data={data} />
    </>
  )
}

export default Unstaking
