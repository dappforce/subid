import { isEthereumAddress } from '@polkadot/util-crypto'
import { AnyApi } from '@acala-network/sdk-core'
import { checkMessageVersionIsV3 } from '@polkawallet/bridge/utils/check-message-version'
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
