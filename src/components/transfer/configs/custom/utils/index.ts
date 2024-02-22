import { isEthereumAddress } from '@polkadot/util-crypto'
import { AnyApi } from '@acala-network/sdk-core'
import { checkMessageVersionIsV3 } from '@polkawallet/bridge/utils/check-message-version'
import { ExtendedToken } from '@polkawallet/bridge'
import { BN } from '@polkadot/util';
export type AddressType = 'substract' | 'ethereum'

export const getValidDestAddrType = (
  address: string,
  _token: string,
  _to?: string
): AddressType => {
  if (isEthereumAddress(address)) {
    return 'ethereum'
  }
  return 'substract'
}

export function createPolkadotXCMAccount (
  api: AnyApi,
  accountId: string,
  field: 'id' | 'key',
  accountType = 'AccountId32'
): any {
  const isV3 = checkMessageVersionIsV3(api)
  const versionTag = isV3 ? 'V3' : 'V1'

  return {
    [versionTag]: {
      parents: 0,
      interior: {
        X1: {
          [accountType]: { [field]: accountId, network: isV3 ? undefined : 'Any' },
        },
      },
    },
  }
}

export const statemineTokensConfig: Record<string, ExtendedToken> = {
  KSM: {
    name: 'KSM',
    symbol: 'KSM',
    decimals: 12,
    ed: '79999999',
    toRaw: () => 'NATIVE',
  },
  RMRK: {
    name: 'RMRK',
    symbol: 'RMRK',
    decimals: 10,
    ed: '100000000',
    toRaw: () => new BN(8),
  },
  ARIS: {
    name: 'ARIS',
    symbol: 'ARIS',
    decimals: 8,
    ed: '10000000',
    toRaw: () => new BN(16),
  },
  USDT: {
    name: 'USDT',
    symbol: 'USDT',
    decimals: 6,
    ed: '1000',
    toRaw: () => new BN(1984),
  },
}

export const statemintTokensConfig: Record<string, ExtendedToken> = {
  DOT: {
    name: 'DOT',
    symbol: 'DOT',
    decimals: 10,
    ed: '10000000000',
    toRaw: () => 'NATIVE',
  },
  USDT: {
    name: 'USDT',
    symbol: 'USDT',
    decimals: 6,
    ed: '700000',
    toRaw: () => new BN(1984),
  },
  USDC: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6,
    ed: '700000',
    toRaw: () => new BN(1337),
  },
  PINK: {
    name: 'PINK',
    symbol: 'PINK',
    decimals: 10,
    ed: '1',
    toRaw: () => new BN(23),
  },
}
