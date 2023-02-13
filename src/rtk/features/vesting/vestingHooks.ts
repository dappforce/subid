import { useAppSelector } from '../../app/store'
import { toGenericAccountId, toGenericAccountIds } from '../../app/util'
import { AnyAction } from 'redux'
import { Dispatch } from 'react'
import { selectVesting, vestingActions, VestingEntity } from './vestingSlice'

export const fetchVestingData = (
  dispatch: Dispatch<AnyAction>,
  accounts: string[],
  networks: string[],
  reload?: boolean
) => {
  const genericAccounts = toGenericAccountIds(accounts)

  dispatch(
    vestingActions.fetchVesting({
      accounts: genericAccounts,
      networks,
      reload,
    })
  )
}

export const useVesting = (address: string, network: string) =>
  useAppSelector<VestingEntity | undefined>((state) =>
    selectVesting(state, toGenericAccountId(address), network)
  )
