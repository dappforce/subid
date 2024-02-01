import { useMyAddress } from '@/components/providers/MyExtensionAccountsContext'
import { useGetChainDataByNetwork } from '@/components/utils/useGetDecimalsAndSymbolByNetwork'
import { useBalancesByNetwork } from '@/rtk/features/balances/balancesHooks'
import { calculateBalanceForStaking } from '@/utils/balance'
import { BN_ZERO } from '@polkadot/util'
import Button from '../tailwind-components/Button'
import { useBackerLedger } from '@/rtk/features/creatorStaking/backerLedger/backerLedgerHooks'
import BN from 'bignumber.js'

const BannerActionButtons = () => {
  const myAddress = useMyAddress()
  const { tokenSymbol } = useGetChainDataByNetwork('subsocial')

  const { currencyBalance: balancesByCurrency } = useBalancesByNetwork({
    address: myAddress,
    network: 'subsocial',
    currency: tokenSymbol,
  })

  const availableBalance = balancesByCurrency
    ? calculateBalanceForStaking(balancesByCurrency, 'crestake')
    : BN_ZERO

  const haveSub = !availableBalance.isZero()

  console.log(availableBalance.toString())

  const text = !haveSub
    ? 'To start earning from Content Staking, you first need to get some SUB:'
    : 'To start earning from Content Staking, you need to lock at least 2,000 SUB:'

  return (
    <div className='flex flex-col gap-6 items-center'>
      <div className='text-lg font-normal text-slate-900'>{text}</div>
      <div>
        {haveSub ? (
          <LockingButtons />
        ) : (
          <Button size={'md'} variant={'primary'}>
            Get SUB
          </Button>
        )}
      </div>
    </div>
  )
}

const LockingButtons = () => {
  const myAddress = useMyAddress()
  const backerLedger = useBackerLedger(myAddress)
  const { ledger } = backerLedger || {}
  const { locked } = ledger || {}

  const isLockedTokens = !new BN(locked || '0').isZero()

  const lockSubButtonText = isLockedTokens ? 'Lock more SUB' : 'Lock SUB'

  return (
    <div className='flex items-center gap-6'>
      <Button size={'md'} variant={'primary'}>
        {lockSubButtonText}
      </Button>
      {isLockedTokens && (
        <Button size={'md'} variant={'redOutline'}>
          Unlock SUB
        </Button>
      )}
    </div>
  )
}

export default BannerActionButtons
