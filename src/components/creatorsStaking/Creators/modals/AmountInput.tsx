import clsx from 'clsx'
import { ChangeEventHandler } from 'react'
import Input from '../../tailwind-components/inputs/Input'
import Button from '../../tailwind-components/Button'
import { useBalancesByNetwork } from 'src/rtk/features/balances/balancesHooks'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { getTransferableBalance } from 'src/utils/balance'
import { BN_ZERO } from '@polkadot/util'
import { convertToBalanceWithDecimal } from '@subsocial/utils'
import { BIGNUMBER_ZERO } from 'src/config/app/consts'
import { FormatBalance } from 'src/components/common/balances'

type AmountInputProps = {
  setAmount: (amount: string) => void
  inputError?: string
  setInputError: (error?: string) => void
  amount: string
  tokenSymbol: string
  decimals?: number
  label: string
  balanceLabel: string
}

const AmountInput = ({
  amount,
  setAmount,
  setInputError,
  inputError,
  tokenSymbol,
  decimals,
  balanceLabel,
  label,
}: AmountInputProps) => {
  const myAddress = useMyAddress()

  const balancesByCurrency = useBalancesByNetwork({
    address: myAddress,
    network: 'subsocial',
    currency: tokenSymbol,
  })

  const availableBalance = balancesByCurrency
    ? getTransferableBalance(balancesByCurrency)
    : BN_ZERO

  const maxAmount = decimals
    ? convertToBalanceWithDecimal(availableBalance.toString(), decimals)
    : BIGNUMBER_ZERO

  const balanceValue = (
    <FormatBalance
      value={availableBalance}
      decimals={decimals}
      currency={tokenSymbol}
      isGrayDecimal={false}
    />
  )

  const onInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const amountInputValue = e.target.value

    setAmount(amountInputValue)
  }

  return (
    <div>
      <div className='mb-2 flex justify-between text-sm font-normal leading-4 text-text-muted'>
        <div>{label}</div>
        <div>
          {balanceLabel}:{' '}
          <span className={clsx('font-bold text-black')}>
            {balanceValue}
          </span>
        </div>
      </div>
      <Input
        step={0.1}
        min={0}
        value={amount}
        autoFocus
        onChange={onInputChange}
        error={inputError}
        rightElement={() => (
          <div>
            <Button
              variant='transparent'
              className={clsx(
                '!absolute bottom-0 right-3 top-0 my-auto !p-1 text-indigo-400',
                'hover:text-indigo-500 hover:ring-0'
              )}
              onClick={() => maxAmount && setAmount(maxAmount.toString())}
            >
              Max
            </Button>
          </div>
        )}
        type='number'
        className={clsx(
          'h-[54px] pr-16 text-base leading-6 ring-1 ring-inset ring-gray-500',
          'focus:outline-none focus:ring-1 focus:ring-gray-400',
          'hover:outline-none hover:ring-1 hover:ring-gray-400',
          'focus-visible:!ring-1 focus-visible:ring-gray-400',
          'bg-slate-200 text-black'
        )}
      />
    </div>
  )
}

export default AmountInput
