import { useMyAddress } from '@/components/providers/MyExtensionAccountsContext'
import { useGetChainDataByNetwork } from '@/components/utils/useGetDecimalsAndSymbolByNetwork'
import { useBalancesByNetwork } from '@/rtk/features/balances/balancesHooks'
import { calculateBalanceForStaking } from '@/utils/balance'
import { BN_ZERO } from '@polkadot/util'
import Button from '../tailwind-components/Button'
import { useBackerLedger } from '@/rtk/features/creatorStaking/backerLedger/backerLedgerHooks'
import BN from 'bignumber.js'
import StakingModal, { StakingModalVariant } from '../modals/StakeModal'
import { useState } from 'react'
import { ACTIVE_STAKING_SPACE_ID } from '../utils/consts'
import { useResponsiveSize } from '@/components/responsive'

const BannerActionButtons = () => {
  const myAddress = useMyAddress()
  const backerLedger = useBackerLedger(myAddress)
  const { isMobile } = useResponsiveSize()

  const { ledger } = backerLedger || {}
  const { locked } = ledger || {}

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

  const isLockedTokens = !new BN(locked || '0').isZero()

  const text = !haveSub
    ? 'To start earning from Content Staking, you first need to get some SUB:'
    : 'To start earning from Content Staking, you need to lock at least 2,000 SUB:'

  return (
    <div className='flex flex-col md:gap-6 gap-4 items-center'>
      {!isLockedTokens && (
        <div className='text-lg font-normal text-center text-slate-900'>{text}</div>
      )}
      <div>
        {haveSub ? (
          <LockingButtons locked={locked} />
        ) : (
          <Button
            size={isMobile ? 'md' : 'lg'}
            href='https://docs.subsocial.network/docs/tutorials/GetSUB/get-sub'
            target='_blank'
            className='hover:text-white'
            variant={'primary'}
          >
            Get SUB
          </Button>
        )}
      </div>
    </div>
  )
}

type LockingButtonsProps = {
  locked?: string
}

const LockingButtons = ({ locked }: LockingButtonsProps) => {
  const [ openStakeModal, setOpenStakeModal ] = useState(false)
  const [ modalVariant, setModalVariant ] = useState<StakingModalVariant>('stake')
  const [ amount, setAmount ] = useState('0')
  const { isMobile } = useResponsiveSize()

  const isLockedTokens = !new BN(locked || '0').isZero()

  const lockSubButtonText = isLockedTokens ? 'Lock more SUB' : 'Lock SUB'

  const onButtonClick = (modalVariant: StakingModalVariant) => {
    setOpenStakeModal(true)
    setModalVariant(modalVariant)
  }

  return (
    <>
      <div className='flex items-center gap-6'>
        <Button
          size={isMobile ? 'md' : 'lg'}
          variant={'primary'}
          onClick={() =>
            onButtonClick(isLockedTokens ? 'increaseStake' : 'stake')
          }
        >
          {lockSubButtonText}
        </Button>
        {isLockedTokens && (
          <Button
            size={isMobile ? 'md' : 'lg'}
            variant={'redOutline'}
            onClick={() => onButtonClick('unstake')}
          >
            Unlock SUB
          </Button>
        )}

        <StakingModal
          open={openStakeModal}
          closeModal={() => setOpenStakeModal(false)}
          spaceId={ACTIVE_STAKING_SPACE_ID}
          eventSource='creator-card'
          modalVariant={modalVariant}
          amount={amount}
          setAmount={setAmount}
        />
      </div>
    </>
  )
}

export default BannerActionButtons
