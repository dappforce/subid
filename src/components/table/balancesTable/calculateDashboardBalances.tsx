import { BalancesTableInfo } from '../types'
import { BIGNUMBER_ZERO } from 'src/config/app/consts'
import { calculateChildrenBalances } from './utils'
import { BalanceVariant } from './types'
import { isEmptyArray } from '@subsocial/utils'

export const calculateDashboardBalances = (
  balances: BalancesTableInfo[],
  balancesVariant: BalanceVariant,
  isMulti: boolean
) => {
  let freeChainBalances = BIGNUMBER_ZERO
  let lockedChainBalances = BIGNUMBER_ZERO

  if (!balances || isEmptyArray(balances))
    return { freeChainBalances, lockedChainBalances }

  balances?.forEach((info) => {
    const childrenBalances = info?.children

    if (isMulti) {
      childrenBalances?.forEach((childrenInfo) => {
        const childrenBalancesByAccount = childrenInfo?.children

        const { freeCalculatedBalance, lockedCalculatedBalance } =
          calculateChildrenBalances(
            freeChainBalances,
            lockedChainBalances,
            childrenBalancesByAccount
          )

        freeChainBalances = freeCalculatedBalance
        lockedChainBalances = lockedCalculatedBalance
      })
    } else {
      if (balancesVariant === 'chains') {
        const { freeCalculatedBalance, lockedCalculatedBalance } =
          calculateChildrenBalances(
            freeChainBalances,
            lockedChainBalances,
            childrenBalances
          )

        freeChainBalances = freeCalculatedBalance
        lockedChainBalances = lockedCalculatedBalance
      } else {
        childrenBalances?.forEach((childrenBalance) => {
          const { freeCalculatedBalance, lockedCalculatedBalance } =
            calculateChildrenBalances(
              freeChainBalances,
              lockedChainBalances,
              childrenBalance?.children
            )

          freeChainBalances = freeCalculatedBalance
          lockedChainBalances = lockedCalculatedBalance
        })
      }
    }
  })

  return { freeChainBalances, lockedChainBalances }
}