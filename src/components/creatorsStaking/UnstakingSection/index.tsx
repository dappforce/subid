import { useGetChainDataByNetwork } from '@/components/utils/useGetDecimalsAndSymbolByNetwork'
import UnstakingTable, { TimeRemaining } from './UnstakingTable'
import WithdrawTxButton from './WithdrawTxButton'
import { useMyAddress } from '@/components/providers/MyExtensionAccountsContext'
import { useResponsiveSize } from '@/components/responsive'
import { FormatBalance } from '@/components/common/balances'
import { useBackerLedger } from '@/rtk/features/creatorStaking/backerLedger/backerLedgerHooks'
import { useMemo } from 'react'
import { isEmptyArray } from '@subsocial/utils'

const UnstakingSection = () => {
  const myAddress = useMyAddress()
  const { decimal, tokenSymbol } = useGetChainDataByNetwork('subsocial')
  const { isMobile } = useResponsiveSize()

  const backerLedger = useBackerLedger(myAddress)

  const { ledger, loading } = backerLedger || {}

  const data = useMemo(() => {
    if (!ledger) {
      return []
    }

    return ledger.unbondingInfo.unbondingChunks.map((item, i) => {
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
          <TimeRemaining
            className='text-sm text-text-muted'
            unlockEra={item.unlockEra}
          />
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
  }, [ !!ledger, loading, myAddress, isMobile ])

  if (isEmptyArray(data)) return null

  return (
    <div className='flex flex-col gap-4 md:p-6 p-4 bg-white rounded-[20px]'>
      <div className='flex md:flex-row flex-col justify-between items-center gap-4'>
        <div className='font-semibold text-2xl leading-[26px]'>
          Unlocking your SUB tokens
        </div>
        <WithdrawTxButton />
      </div>
      <UnstakingTable data={data} />
    </div>
  )
}

export default UnstakingSection
