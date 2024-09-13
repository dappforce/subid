import { useChainInfoByNetwork } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import {
  decodeExtrinsicString,
  getExtrinsicParams,
} from 'src/utils/extrinsicDecoder'

const getCustomTransferParamId = (token: string, network: string) =>
  `${token}|${network}`
export type SameChainTransferParamData = {
  amount: string
  recipient: string
  tokenId?: any
}

// balances.transfer - parallel, pioneer, romonomics, joystream, turing, parallel heiko, chainx
const customSameChainTransferConfig: {
  [key: string]: {
    getParams: (data: SameChainTransferParamData) => any[]
    extrinsic: string
  }
} = {
  [getCustomTransferParamId('KSM', 'kusama')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('DOT', 'polkadot')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('ACA', 'acala')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('ASTR', 'astar')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('BNC', 'bifrostKusama')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('KSM', 'statemine')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('DOT', 'statemint')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('UNQ', 'unique')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('KAR', 'karura')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('PEN', 'pendulum')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('HDX', 'hydradx')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('SDN', 'shiden')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('PHA', 'khala')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('BNC', 'bifrostPolkadot')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('AIR', 'altair')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('BSX', 'basilisk')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('KMA', 'calamari')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('TEER', 'integritee')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('NUUM', 'continuum')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('CFG', 'centrifuge')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('NEURO', 'originTrail')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('MANTA', 'manta')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('PICA', 'picasso')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('PDEX', 'polkadex-polkadot')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('NODL', 'nodle')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('RING', 'darwinia')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('CRAB', 'darwinia-crab')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('TNKR', 'invArch')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('VARCH', 'invArch-polkadot')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('QTZ', 'quartz')]: {
    extrinsic: 'balances.transferAllowDeath',
    getParams: (data) => {
      return [data.recipient, data.amount]
    },
  },
  [getCustomTransferParamId('MGX', 'mangata')]: {
    extrinsic: 'tokens.transfer',
    getParams: (data) => {
      return [data.recipient, 0, data.amount]
    },
  },
  [getCustomTransferParamId('KINT', 'kintsugi')]: {
    extrinsic: 'tokens.transfer',
    getParams: (data) => {
      return [data.recipient, { Token: 'KINT' }, data.amount]
    },
  },
  [getCustomTransferParamId('INTR', 'interlay')]: {
    extrinsic: 'tokens.transfer',
    getParams: (data) => {
      return [data.recipient, { Token: 'INTR' }, data.amount]
    },
  },
}

export function useSameChainTransferExtrinsic(
  network: string,
  token: string,
  getTransferData: () => SameChainTransferParamData
) {
  const chainInfo = useChainInfoByNetwork(network)

  const getExtrinsic = () => {
    const { tokenId } = getTransferData()
    const customConfig =
      customSameChainTransferConfig[getCustomTransferParamId(token, network)]
    if (customConfig) {
      return customConfig.extrinsic
    } else if (!tokenId) {
      return 'balances.transfer'
    } else {
      const { extrinsic } = decodeExtrinsicString(
        chainInfo?.tokenTransferMethod || ''
      )
      return extrinsic
    }
  }

  const getParams = () => {
    const transferData = getTransferData()
    const { amount, recipient, tokenId } = transferData

    const customGetter =
      customSameChainTransferConfig[getCustomTransferParamId(token, network)]
    if (customGetter) return customGetter.getParams({ ...transferData })

    if (!tokenId) {
      return [recipient, amount]
    }

    const method = chainInfo?.tokenTransferMethod
    return getExtrinsicParams(method ?? '', {
      recipient,
      id: tokenId.id,
      amount,
    })
  }

  return { getParams, getExtrinsic }
}
