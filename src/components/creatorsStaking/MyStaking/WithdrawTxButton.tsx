import LazyTxButton from 'src/components/lazy-connection/LazyTxButton'
import Button from '../tailwind-components/Button'
import {
  fetchStakerLedger,
  useStakerLedger,
} from 'src/rtk/features/creatorStaking/stakerLedger/stakerLedgerHooks'
import { fetchBalanceByNetwork } from 'src/rtk/features/balances/balancesHooks'
import { useEffect, useMemo } from 'react'
import { isEmptyArray } from '@subsocial/utils'
import { useAppDispatch } from 'src/rtk/app/store'
import { useGeneralEraInfo } from 'src/rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import BN from 'bignumber.js'
import { showParsedErrorMessage } from 'src/components/utils'

type WithdrawTxButtonProps = {
  switchToFirstTab: () => void
}

const WithdrawTxButton = ({ switchToFirstTab }: WithdrawTxButtonProps) => {
  const myAddress = useMyAddress()
  const stakerLedger = useStakerLedger(myAddress)
  const eraInfo = useGeneralEraInfo()
  const dispatch = useAppDispatch()

  const { ledger, loading } = stakerLedger || {}
  const { currentEra } = eraInfo || {}

  const unlockingChunks = ledger?.unbondingInfo.unlockingChunks

  useEffect(() => {
    if (unlockingChunks?.length === 0) {
      switchToFirstTab()
    }
  }, [ unlockingChunks?.length ])

  const isSomeAvailable = useMemo(() => {
    if (
      !currentEra || 
      !unlockingChunks || 
      isEmptyArray(unlockingChunks) ||
      loading
    ) {
      return false
    }

    return unlockingChunks?.some((item) => {
      const { unlockEra } = item

      return new BN(currentEra).gte(new BN(unlockEra))
    })
  }, [ !!unlockingChunks?.length, currentEra, loading ])

  console.log(isSomeAvailable)

  const onSuccess = () => {
    const address = myAddress || ''
    
    fetchStakerLedger(dispatch, address)
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
      onFailed={showParsedErrorMessage}
      onSuccess={onSuccess}
    />
  )
}

export default WithdrawTxButton
