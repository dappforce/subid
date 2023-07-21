import { BalancesTableInfo } from '../types'
import { BalanceEntityRecord } from '../../../rtk/features/balances/balancesSlice'
import { MultiChainInfo } from '../../../rtk/features/multiChainInfo/types'
import { AccountIdentitiesRecord } from '../../../rtk/features/identities/identitiesSlice'
import { TFunction } from 'i18next'
import { AccountInfoByChain } from 'src/components/identity/types'
import BN from 'bignumber.js'
import {
  ChainData,
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
import { SubIcon, convertAddressToChainFormat } from 'src/components/utils'
import { LinksButton } from './Links'
import { Button } from 'antd'
import { FiSend } from 'react-icons/fi'
import { getBalancePart } from './utils'

type ParseBalanceTableInfoProps = {
  chainsInfo: MultiChainInfo
  tokenPrices: any
  identities?: AccountIdentitiesRecord
  isMulti?: boolean
  balancesEntities?: BalanceEntityRecord
  isMobile: boolean
  onTransferClick: (
    token: string,
    network: string,
    tokenId?: { id: any }
  ) => void
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
    const { balancesByNetwork, decimals, totalBalance, firstNetwork } =
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

    const children = getChildrenBalances({
      balancesByNetwork,
      isMobile,
      isMulti,
      identities,
      priceValue,
      tokenId,
      chainsInfo,
      onTransferClick,
      t,
    })

    childrenBalances.children = [...children]

    const chainInfo = chainsInfo[firstNetwork]

    const onButtonClick = (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation()
      e.currentTarget?.blur()

      const { assetsRegistry, tokenSymbols } = chainInfo
      const asset = assetsRegistry?.[tokenId]

      const currency = asset?.currency

      const isNativeToken = tokenSymbols[0] === tokenId
      const assetRedistyId = !isNativeToken ? currency : undefined

      onTransferClick(tokenId, firstNetwork, { id: assetRedistyId })
    }

    return {
      key: tokenId,
      chain: isMulti ? <div className="ml-5">{tokenId}</div> : tokenId,
      balance: getBalancePart(balance, true),
      price,
      total: <BalanceView value={totalValue} symbol="$" startWithSymbol />,
      totalTokensValue: totalValue,
      icon: '',
      name: tokenId,
      address: '',
      totalValue: totalValue,
      balanceWithoutChildren: getBalancePart(balance, false),
      balanceValue: totalBalance,
      balanceView: getBalancePart(balance, true),
      links: [],
      transferAction: (
        <Button
          disabled={!chainInfo.isTransferable}
          size="small"
          shape={'circle'}
          onClick={onButtonClick}
        >
          <SubIcon Icon={FiSend} className={styles.TransferIcon} />
        </Button>
      ),

      ...childrenBalances,
    } as BalancesTableInfo
  })

  const balancesInfo = parsedData.filter(isDef).flat()

  const balancesInfoSorted = balancesInfo.sort((a, b) =>
    (b.totalTokensValue || new BN(0))
      .minus(a.totalTokensValue || new BN(0))
      .toNumber()
  )

  const tokenIds = balancesInfoSorted.map((item) => item.key)

  console.log(tokenIds)
  return balancesInfoSorted
}

type BalanceByToken = {
  totalBalance: BN
  firstNetwork: string
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
  const address = Object.keys(balancesEntities)[0]

  balancesEntityFirst?.forEach(({ network, info }) => {
    const chainInfo = multiChainInfo[network]

    const { ss58Format } = chainInfo

    Object.entries(info).forEach(([tokenId, balances]) => {
      const {
        balancesByNetwork,
        firstNetwork,
        totalBalance: totalBalanceSum,
      } = balancesByToken[tokenId] || {}

      const { totalBalance: newTotalBalance } = balances

      const totalBalanceValue = (totalBalanceSum || new BN('0')).plus(
        newTotalBalance || '0'
      )

      const { decimal } = getDecimalsAndSymbol(chainInfo, tokenId)

      balancesByToken[tokenId] = {
        totalBalance: totalBalanceValue,
        decimals: decimal,
        firstNetwork: firstNetwork || network,
        balancesByNetwork: {
          ...(balancesByNetwork || {}),
          [network]: {
            ...balances,
            accountId: convertAddressToChainFormat(address, ss58Format),
          } as AccountInfoByChain,
        },
      }
    })
  })

  return balancesByToken
}

type AccountDataKeys = keyof Omit<Balances, 'totalBalance'>

type Balances = {
  totalBalance: string
  reservedBalance: string
  frozenFee: string
  freeBalance: string
  frozenMisc: string
}

type GetChildrenBalanceParams = {
  balancesByNetwork: Record<string, AccountInfoByChain>
  isMulti?: boolean
  isMobile: boolean
  chainsInfo: MultiChainInfo
  tokenId: string
  priceValue: string
  identities?: AccountIdentitiesRecord
  onTransferClick: (
    token: string,
    network: string,
    tokenId: { id: any }
  ) => void
  t: TFunction
}

function getChildrenBalances({
  balancesByNetwork,
  isMulti,
  chainsInfo,
  tokenId,
  priceValue,
  onTransferClick,
  t,
}: GetChildrenBalanceParams): BalancesTableInfo[] {
  const balancesByNetworkEntries = Object.entries(balancesByNetwork)

  const result = balancesByNetworkEntries.map(([network, balances]) => {
    const { totalBalance, accountId, ...otherBalances } = balances

    const chainInfo = chainsInfo[network]

    const { icon, name } = chainInfo

    const { decimal } = getDecimalsAndSymbol(chainInfo, tokenId)

    const balanceValue = getBalanceWithDecimals({
      totalBalance: totalBalance ?? '0',
      decimals: decimal,
    })

    if (balanceValue.isZero()) return

    const { totalValue, balance, price } = getBalances({
      balanceValue,
      priceValue,
      symbol: tokenId,
      t,
    })

    const childrenBalances: any = {}

    const otherBalancesBN: {
      [key in AccountDataKeys]: BN
    } = {} as any

    Object.entries(otherBalances).forEach(
      ([key, value]) =>
        (otherBalancesBN[key as AccountDataKeys] = new BN(value || '0'))
    )

    const accountData = getAccountDataRows({
      ...otherBalancesBN,
      t,
      price,
      priceValue,
      isMulti,
      tokenId,
      decimal,
    })

    childrenBalances.children = [...accountData.reverse()]

    const chain = <ChainData icon={icon} name={name} avatarSize={'small'} />

    const onButtonClick = (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation()
      e.currentTarget?.blur()

      const { assetsRegistry, tokenSymbols } = chainInfo
      const asset = assetsRegistry?.[tokenId]

      const currency = asset?.currency

      const isNativeToken = tokenSymbols[0] === tokenId
      const assetRedistyId = !isNativeToken ? currency : undefined

      onTransferClick(tokenId, network, { id: assetRedistyId })
    }

    return {
      key: network,
      chain: <div className="ml-5">{chain}</div>,
      balance: getBalancePart(balance, true),
      price,
      total: <BalanceView value={totalValue} symbol="$" startWithSymbol />,
      totalTokensValue: totalValue,
      icon,
      name: network,
      address: accountId,
      totalValue: totalValue,
      balanceWithoutChildren: getBalancePart(balance, false),
      balanceValue: balanceValue,
      balanceView: getBalancePart(balance, true),
      links: (
        <LinksButton
          network={network}
          action={onButtonClick}
          showActionButton={false}
        />
      ),
      showLinks: (isShow: boolean) => (
        <LinksButton
          action={onButtonClick}
          network={network}
          showActionButton={isShow}
        />
      ),
      transferAction: (
        <Button
          disabled={!chainInfo.isTransferable}
          size="small"
          shape={'circle'}
          onClick={onButtonClick}
        >
          <SubIcon Icon={FiSend} className={styles.TransferIcon} />
        </Button>
      ),
      ...childrenBalances,
    } as BalancesTableInfo
  })

  return result.filter(isDef)
}

type GetAccountDataValuesParams = {
  reservedBalance: BN
  frozenFee: BN
  freeBalance: BN
  frozenMisc: BN
  t: TFunction
}

function getAccountDataValues({ t, ...info }: GetAccountDataValuesParams) {
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

type GetAccountDataRowsParams = GetAccountDataValuesParams & {
  decimal: number
  priceValue: string
  price: JSX.Element
  tokenId: string
  isMulti?: boolean
}

function getAccountDataRows({
  decimal,
  price,
  priceValue,
  tokenId,
  isMulti,
  t,
  ...accountDataValuesParams
}: GetAccountDataRowsParams) {
  const accountDataValues = getAccountDataValues({
    t,
    ...accountDataValuesParams,
  })

  const accountDataArray = accountDataValues.map(
    ({ key, label, value }: any) => {
      const valueWithDecimal = getBalanceWithDecimals({
        totalBalance: value,
        decimals: decimal,
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
    }
  )

  return accountDataArray
}
