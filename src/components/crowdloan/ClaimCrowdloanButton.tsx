import React, { HTMLProps, useMemo, useRef } from 'react'
import { fetchVestingData, useVesting } from 'src/rtk/features/vesting/vestingHooks'
import LazyTxButton, { TxButtonProps } from '../lazy-connection/LazyTxButton'
import { useMyAddress } from '../providers/MyExtensionAccountsContext'
import BN from 'bignumber.js'
import { useAppDispatch } from 'src/rtk/app/store'
import { WarningOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import { fetchBalanceByNetwork } from 'src/rtk/features/balances/balancesHooks'
import { getBalanceWithDecimals } from '../table/utils'
import { useChainInfoByNetwork } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import { formatBalance } from '@polkadot/util'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import { useClaimCrowdloanContext } from './ClaimCrowdloanContext'

export type ClaimCrowdloanButtonProps = Omit<TxButtonProps, 'tx' | 'accountId'> & {
  address: string
  containerProps?: HTMLProps<HTMLDivElement>
}

const MINIMUM_CLAIMABLE_AMOUNT = 0.01

export default function ClaimCrowdloanButton ({ address, label, containerProps, ...props }: ClaimCrowdloanButtonProps) {
  const { t } = useTranslation()
  const { loadingTx, setLoadingTx, openModal } = useClaimCrowdloanContext()
  const claimedToken = useRef('')

  const chainInfo = useChainInfoByNetwork(props.network)
  const { tokenDecimals, tokenSymbols, nativeToken, vestingMethod } = chainInfo || {}
  const { unit: defaultCurrency, decimals: defaultDecimal } = formatBalance.getDefaults()
  const tokenDecimal = tokenDecimals?.[0] || defaultDecimal
  const tokenSymbol = nativeToken || tokenSymbols?.[0] || defaultCurrency

  const dispatch = useAppDispatch()
  const vestingData = useVesting(address, props.network)
  const myAddress = useMyAddress()

  const claimableAmt = vestingData?.vestingData?.claimable
  const anyClaimable = useMemo(() => {
    const claimable = new BN(claimableAmt ?? '0')
    const parsedAmt = getBalanceWithDecimals({ totalBalance: claimable.toString() || '0', decimals: tokenDecimal })
    return parsedAmt.isGreaterThanOrEqualTo(MINIMUM_CLAIMABLE_AMOUNT)
  }, [ claimableAmt ])

  const onClick = () => {
    const parsedAmt = getBalanceWithDecimals({ totalBalance: (claimableAmt || '0').toString(), decimals: tokenDecimal })
    const floatAmt = parsedAmt.toNumber().toFixed(4)
    claimedToken.current = `${floatAmt} ${tokenSymbol}`
    setLoadingTx(true)
    props.onClick?.()
  }

  const onError = (e: any) => {
    setLoadingTx(false)
    props.onError?.(e)
  }

  const onSuccess = () => {
    fetchVestingData(dispatch, [ address ], [ props.network ], true)
    fetchBalanceByNetwork(dispatch, [ address ], props.network)
    openModal(claimedToken.current)
    claimedToken.current = ''
  }

  const disabled = loadingTx || !anyClaimable || !vestingMethod || props.disabled || !myAddress
  const canClaimButNotSupported = !vestingMethod && anyClaimable

  const buttonComponent = (
    <div {...containerProps}>
      <LazyTxButton
        {...props}
        style={{ ...props.style, pointerEvents: disabled ? 'none' : 'unset' }}
        accountId={myAddress}
        tx={vestingMethod ?? ''}
        disabled={disabled}
        onClick={onClick}
        onFailed={onError}
        onError={onError}
        onSuccess={onSuccess}
        withSpinner={false}
        className={clsx(props.className, 'd-flex justify-content-center align-items-center')}
        label={
          <span className='d-flex align-items-center justify-content-center'>
            {canClaimButNotSupported ? (
              <>
                <WarningOutlined className='mr-1 FontSmall' />
                {label}
              </>
            ) : label}
          </span>
        }
      />
    </div>
  )

  return (
    canClaimButNotSupported ? (
      <Tooltip title={t('tooltip.claimNotSupported')}>
        {buttonComponent}
      </Tooltip>
    ) : buttonComponent
  )
}
