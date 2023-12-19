import LazyTxButton from 'src/components/lazy-connection/LazyTxButton'
import Button from '../tailwind-components/Button'
import {
  fetchBackerLedger,
  useBackerLedger,
} from 'src/rtk/features/creatorStaking/backerLedger/backerLedgerHooks'
import { fetchBalanceByNetwork } from 'src/rtk/features/balances/balancesHooks'
import { useEffect, useMemo } from 'react'
import { isEmptyArray } from '@subsocial/utils'
import { useAppDispatch } from 'src/rtk/app/store'
import { useGeneralEraInfo } from 'src/rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import BN from 'bignumber.js'
import { showParsedErrorMessage } from 'src/components/utils'
import { useSendEvent } from '@/components/providers/AnalyticContext'

type WithdrawTxButtonProps = {
  switchToFirstTab: () => void
}

const WithdrawTxButton = ({ switchToFirstTab }: WithdrawTxButtonProps) => {
  const myAddress = useMyAddress()
  const backerLedger = useBackerLedger(myAddress)
  const eraInfo = useGeneralEraInfo()
  const dispatch = useAppDispatch()
  const sendEvent = useSendEvent()

  const { ledger, loading } = backerLedger || {}
  const { currentEra } = eraInfo?.info || {}

  const unbondingChunks = ledger?.unbondingInfo.unbondingChunks

  useEffect(() => {
    if (unbondingChunks?.length === 0) {
      switchToFirstTab()
    }
  }, [ unbondingChunks?.length ])

  const isSomeAvailable = useMemo(() => {
    if (
      !currentEra || 
      !unbondingChunks || 
      isEmptyArray(unbondingChunks) ||
      loading
    ) {
      return false
    }

    return unbondingChunks?.some((item) => {
      const { unlockEra } = item

      return new BN(currentEra).gte(new BN(unlockEra))
    })
  }, [ !!unbondingChunks?.length, currentEra, loading ])

  const onSuccess = () => {
    const address = myAddress || ''
    
    fetchBackerLedger(dispatch, address)
    fetchBalanceByNetwork(dispatch, [ address ], 'subsocial')
  }

  const Component: React.FunctionComponent<{ onClick?: () => void }> = (
    compProps
  ) => (
    <Button {...compProps} variant={'primary'} size={'sm'}>
      Withdraw available
    </Button>
  )

  return (
    <LazyTxButton
      network='subsocial'
      accountId={myAddress}
      tx={'creatorStaking.withdrawUnstaked'}
      disabled={!isSomeAvailable}
      component={Component}
      onClick={() => sendEvent('cs_withdraw')}
      onFailed={showParsedErrorMessage}
      onSuccess={onSuccess}
    />
  )
}

export default WithdrawTxButton
