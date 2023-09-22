import { AcalaAdapter, KaruraAdapter } from '@polkawallet/bridge/adapters/acala'
import { AstarAdapter, ShidenAdapter } from '@polkawallet/bridge/adapters/astar'
import { AltairAdapter } from '@polkawallet/bridge/adapters/centrifuge'
import { ShadowAdapter } from '@polkawallet/bridge/adapters/crust'
import { CrabAdapter } from '@polkawallet/bridge/adapters/darwinia'
import { BasiliskAdapter } from '@polkawallet/bridge/adapters/hydradx'
import { InterlayAdapter, KintsugiAdapter } from '@polkawallet/bridge/adapters/interlay'
import { KicoAdapter } from '@polkawallet/bridge/adapters/kico'
import { PichiuAdapter } from '@polkawallet/bridge/adapters/kylin'
import { CalamariAdapter } from '@polkawallet/bridge/adapters/manta'
import { MoonbeamAdapter, MoonriverAdapter } from '@polkawallet/bridge/adapters/moonbeam'
import { KhalaAdapter } from '@polkawallet/bridge/adapters/phala'
import { PolkadotAdapter, KusamaAdapter } from '@polkawallet/bridge/adapters/polkadot'
import { StatemineAdapter } from '@polkawallet/bridge/adapters/statemint'
import { QuartzAdapter } from '@polkawallet/bridge/adapters/unique'
import { BaseCrossChainAdapter } from '@polkawallet/bridge/base-chain-adapter'
import { Bridge, Chain, ChainId, RouterFilter } from '@polkawallet/bridge'
// import { BifrostAdapter } from '@polkawallet/bridge/adapters/bifrost'
// import { IntegriteeAdapter } from '@polkawallet/bridge/adapters/integritee'
// import { TuringAdapter } from '@polkawallet/bridge/adapters/oak'
// import { HeikoAdapter, ParallelAdapter } from '@polkawallet/bridge/adapters/parallel'

const availableAdapters: Record<string, { adapter: BaseCrossChainAdapter; chainName?: ChainId }> = {
  polkadot: {
    adapter: new PolkadotAdapter(),
  },
  kusama: {
    adapter: new KusamaAdapter(),
  },
  karura: {
    adapter: new KaruraAdapter(),
  },
  astar: {
    adapter: new AstarAdapter(),
  },
  shiden: {
    adapter: new ShidenAdapter(),
  },
  acala: {
    adapter: new AcalaAdapter(),
  },
  statemine: {
    adapter: new StatemineAdapter(),
  },
  statemint: {
    adapter: new StatemineAdapter(),
  },
  altair: {
    adapter: new AltairAdapter(),
  },
  shadow: {
    adapter: new ShadowAdapter(),
  },
  'darwinia-crab-parachain': {
    adapter: new CrabAdapter(),
    chainName: 'crab'
  },
  basilisk: {
    adapter: new BasiliskAdapter(),
  },
  kintsugi: {
    adapter: new KintsugiAdapter(),
  },
  interlay: {
    adapter: new InterlayAdapter(),
  },
  kico: {
    adapter: new KicoAdapter(),
  },
  pichiu: {
    adapter: new PichiuAdapter(),
  },
  calamari: {
    adapter: new CalamariAdapter(),
  },
  moonbeam: {
    adapter: new MoonbeamAdapter(),
  },
  moonriver: {
    adapter: new MoonriverAdapter(),
  },
  khala: {
    adapter: new KhalaAdapter(),
  },
  quartz: {
    adapter: new QuartzAdapter(),
  },
  // TODO: uncomment when new polkawallet version is up and supports networks below
  // bifrost: {
  //   adapter: new BifrostAdapter(),
  // },
  // integritee: {
  //   adapter: new IntegriteeAdapter(),
  // },
  // turing: {
  //   adapter: new TuringAdapter(),
  // },
  // parallel: {
  //   adapter: new ParallelAdapter(),
  // },
  // parallelHeiko: {
  //   adapter: new HeikoAdapter(),
  //   chainName: 'heiko'
  // },
}

function getPolkawalletChainName (chain: string) {
  const chainData = availableAdapters[chain]
  if (!chainData) return undefined
  return chainData.chainName || chain as ChainId
}

const polkawalletChainToSubidNetworkMap = Object.entries(
  availableAdapters
).reduce((acc, [ subIdNetwork, { chainName } ]) => {
  acc[chainName || subIdNetwork as ChainId] = subIdNetwork
  return acc
}, {} as Record<ChainId, string>)

const bridge = new Bridge({ adapters: Object.values(availableAdapters).map(({ adapter }) => adapter) })

export function getCrossChainBridge () {
  return bridge
}

export function getCrossChainAdapter (chain: string): BaseCrossChainAdapter | undefined {
  return availableAdapters[chain]?.adapter
}

export function isTokenBridgeable (token: string) {
  const sourceChains = bridge.router.getFromChains({ token })
  const destChains = bridge.router.getDestinationChains({ token })

  const filterAvailableChains = (chain: Chain) => {
    const networkName = polkawalletChainToSubidNetworkMap[chain.id as ChainId]
    return availableAdapters[networkName]
  }

  const filteredSourceChains = sourceChains.filter(filterAvailableChains)
  const filteredDestChains = destChains.filter(filterAvailableChains)

  const hasSourceChains = filteredSourceChains.length > 0
  const hasDestChains = filteredDestChains.length > 0

  let isSameChains = false
  if (filteredSourceChains.length === 1 && filteredDestChains.length === 1) {
    isSameChains = filteredSourceChains[0].id === filteredDestChains[0].id
  }

  return hasSourceChains && hasDestChains && !isSameChains
}

/**
 * This is utility function to create a new object based on sent obj in param that doesn't have any falsy properties.
 * This is needed because `getFromChains` and `getDestinationChains` won't work when the property is `undefined`.
 * For example, getFromChains({ token: 'ASTR', from: 'astar', to: undefined }) will result in empty data.
 * Because of that, this function will remove `to` from the params in the example.
 * @param obj object to remove falsy properties
 * @returns new object that doesn't include falsy properties
 */
function deleteUndefinedAttributes<T extends object> (obj: T) {
  return Object.entries(obj).reduce<T>((acc, [ key, value ]) => {
    if (value) {
      acc[key as keyof T] = value
    }
    return acc
  }, {} as T)
}

type AugmentedRouterFilter = {
  from?: string
  to?: string
  token?: string
}
export function getRouteOptions (type: 'dest', params: Omit<AugmentedRouterFilter, 'to'>): string[]
export function getRouteOptions (type: 'source', params: Omit<AugmentedRouterFilter, 'from'>): string[]
export function getRouteOptions (type: 'source' | 'dest', params: AugmentedRouterFilter): string[] {
  const bridge = getCrossChainBridge()
  let options: Chain[] = []
  try {
    const parsedParams: RouterFilter = deleteUndefinedAttributes({
      token: params.token,
      from: getPolkawalletChainName(params.from ?? ''),
      to: getPolkawalletChainName(params.to ?? '')
    })
    if (type === 'source') {
      options = bridge.router.getFromChains(parsedParams)
    } else {
      options = bridge.router.getDestinationChains(parsedParams)
    }
  } catch {
    options = []
  }
  return options.map(({ id }) => polkawalletChainToSubidNetworkMap[id as ChainId])
}
