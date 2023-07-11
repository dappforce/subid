import { BalancesTableInfo } from '../types'
import { BalanceEntityRecord } from '../../../rtk/features/balances/balancesSlice'
import { MultiChainInfo } from '../../../rtk/features/multiChainInfo/types'
import { AccountIdentitiesRecord } from '../../../rtk/features/identities/identitiesSlice'
import { TFunction } from 'i18next'
import { AccountInfoByChain } from 'src/components/identity/types'
import BN from 'bignumber.js'
import {
  getBalanceWithDecimals,
  getBalances,
  getDecimalsAndSymbol,
  getPrice,
  resolveAccountDataImage,
} from '../utils'
import { BalanceView } from 'src/components/homePage/address-views/utils'
import { convertToBalanceWithDecimal, isDef } from '@subsocial/utils'
import BaseAvatar from 'src/components/utils/DfAvatar'
import { MutedDiv } from 'src/components/utils/MutedText'
import clsx from 'clsx'
import styles from '../Table.module.sass'

type ParseBalanceTableInfoProps = {
  chainsInfo: MultiChainInfo
  tokenPrices: any
  identities?: AccountIdentitiesRecord
  isMulti?: boolean
  balancesEntities?: BalanceEntityRecord
  isMobile: boolean
  onTransferClick: (token: string, network: string) => void
  t: TFunction
}

export const parseTokenOrientedView = ({
  chainsInfo,
  tokenPrices,
  identities,
  isMulti,
  balancesEntities,
  isMobile,
  onTransferClick,
  t,
}: ParseBalanceTableInfoProps): BalancesTableInfo[] => {
  if (!balancesEntities) return []

  const balancesByToken = parseBalancesByToken(balancesEntities, chainsInfo)

  const balancesByTokenEntries = Object.entries(balancesByToken)

  const parsedData = balancesByTokenEntries.map(([tokenId, balanceByToken]) => {
    const { balancesByNetwork, decimals, totalBalance, ...balances } =
      balanceByToken

    const priceValue = getPrice(tokenPrices, 'symbol', tokenId)

    const balanceValueWithDecimals = convertToBalanceWithDecimal(
      totalBalance.toFormat().replace(/,/g, ''),
      decimals
    )

    const { totalValue, balance, price } = getBalances({
      balanceValue: balanceValueWithDecimals,
      priceValue,
      symbol: tokenId,
      t,
    })

    const childrenBalances: any = {}

    const accountData = getAccountData({ ...balances, t })
    const accountDataArray = accountData.map(({ key, label, value }: any) => {
      const valueWithDecimal = getBalanceWithDecimals({
        totalBalance: value,
        decimals,
      })

      const { total, totalValue, balance } = getBalances({
        balanceValue: valueWithDecimal,
        priceValue,
        symbol: tokenId,
        t,
      })

      const chain = (
        <div className="d-flex align-items-center">
          <BaseAvatar size={24} avatar={resolveAccountDataImage(key)} />
          <div>{label}</div>
        </div>
      )

      return {
        key,
        chain: (
          <MutedDiv
            className={clsx({ [styles.SecondLevelBalances]: isMulti }, 'ml-5')}
          >
            {chain}
          </MutedDiv>
        ),
        balance: <span className="mr-4">{balance}</span>,
        price,
        total,
        totalValue,
        className: styles.Children,
      }
    })

    childrenBalances.children = [...accountDataArray.reverse()]

    return {
      key: tokenId,
      chain: isMulti ? <div className="ml-5">{tokenId}</div> : tokenId,
      balance: getBalancePart(balance, true),
      price,
      total: <BalanceView value={totalValue} symbol="$" startWithSymbol />,
      totalTokensValue: totalValue,
      icon: '',
      name: '',
      address: '',
      totalValue: totalValue,
      balanceWithoutChildren: getBalancePart(balance, false),
      balanceValue: totalBalance,
      balanceView: getBalancePart(balance, true),
      links: [],
      ...childrenBalances,
    } as BalancesTableInfo
  })

  const balancesInfo = parsedData.filter(isDef).flat()

  const balancesInfoSorted = balancesInfo.sort((a, b) =>
    (b.totalTokensValue || new BN(0))
      .minus(a.totalTokensValue || new BN(0))
      .toNumber()
  )

  return balancesInfoSorted
}

type BalanceByToken = {
  totalBalance: BN
  reservedBalance: BN
  frozenFee: BN
  freeBalance: BN
  frozenMisc: BN
  decimals: number
  balancesByNetwork: Record<string, AccountInfoByChain>
}

type BalancesByTokenId = Record<string, BalanceByToken>

function parseBalancesByToken(
  balancesEntities: BalanceEntityRecord,
  multiChainInfo: MultiChainInfo
) {
  const balancesByToken: BalancesByTokenId = {}

  const balancesEntityFirst = Object.values(balancesEntities)[0].balances

  balancesEntityFirst?.forEach(({ network, info }) => {
    const chainInfo = multiChainInfo[network]

    Object.entries(info).forEach(([tokenId, balances]) => {
      const { balancesByNetwork, ...params } = balancesByToken[tokenId] || {}

      const {
        totalBalanceValue,
        reservedBalanceValue,
        freeBalanceValue,
        frozenFeeValue,
        frozenMiscValue,
      } = calcTotalBlalaces(params as unknown as BalancesBN, balances)

      const { decimal } = getDecimalsAndSymbol(chainInfo, tokenId)

      balancesByToken[tokenId] = {
        totalBalance: totalBalanceValue,
        reservedBalance: reservedBalanceValue,
        frozenFee: frozenFeeValue,
        freeBalance: freeBalanceValue,
        frozenMisc: frozenMiscValue,
        decimals: decimal,
        balancesByNetwork: {
          ...(balancesByNetwork || {}),
          [network]: balances,
        },
      }
    })
  })

  return balancesByToken
}

type BalancesBN = {
  totalBalance: BN
  reservedBalance: BN
  frozenFee: BN
  freeBalance: BN
  frozenMisc: BN
}

type Balances = {
  totalBalance: string
  reservedBalance: string
  frozenFee: string
  freeBalance: string
  frozenMisc: string
}

function calcTotalBlalaces(balancesSum: BalancesBN, newBalances: Balances) {
  const {
    totalBalance: totalBalanceSum,
    freeBalance: freeBalancesSum,
    reservedBalance: reservedBalanceSum,
    frozenFee: frozenFeeSum,
    frozenMisc: frozenMiscSum,
  } = balancesSum
  const {
    totalBalance: newTotalBalance,
    freeBalance: newFreeBalances,
    reservedBalance: newReservedBalance,
    frozenFee: newFrozenFee,
    frozenMisc: newfrozenMisc,
  } = newBalances

  const totalBalanceValue = (totalBalanceSum || new BN('0')).plus(
    newTotalBalance || '0'
  )
  const reservedBalanceValue = (reservedBalanceSum || new BN('0')).plus(
    newReservedBalance || '0'
  )
  const freeBalanceValue = (freeBalancesSum || new BN('0')).plus(
    newFreeBalances || '0'
  )
  const frozenFeeValue = (frozenFeeSum || new BN('0')).plus(newFrozenFee || '0')
  const frozenMiscValue = (frozenMiscSum || new BN('0')).plus(
    newfrozenMisc || '0'
  )

  return {
    totalBalanceValue,
    reservedBalanceValue,
    freeBalanceValue,
    frozenFeeValue,
    frozenMiscValue,
  }
}

type GetAccountDataParams = {
  reservedBalance: BN
  frozenFee: BN
  freeBalance: BN
  frozenMisc: BN
  t: TFunction
}

function getAccountData({ t, ...info }: GetAccountDataParams) {
  const { reservedBalance, frozenFee, freeBalance, frozenMisc } = info

  const transferableBalance = new BN(freeBalance || 0)
    .minus(new BN(frozenMisc || frozenFee || 0))
    .toString()

  return [
    {
      key: 'frozen',
      label: t('table.balances.frozen'),
      value: frozenFee?.toString() || '0',
    },
    {
      key: 'locked',
      label: t('table.balances.locked'),
      value: frozenMisc?.toString() || '0',
    },
    {
      key: 'reserved',
      label: t('table.balances.reserved'),
      value: reservedBalance?.toString() || '0',
    },
    {
      key: 'free',
      label: t('table.balances.free'),
      value: transferableBalance,
    },
  ]
}

const getBalancePart = (balance: JSX.Element, withMargin?: boolean) => (
  <div className={clsx('d-grid', withMargin && 'mr-4')}>{balance}</div>
)
