import { AnyAccountId } from '@subsocial/types'
import { ExternalLink } from '../identity/utils'
import styles from './Table.module.sass'
import { RelayChain } from '../../types/index'

const picassoRefCode = 'XHJ2o0'

export const subscanSubdomainByChain: Record<string, string> = {
  kusama: 'kusama',
  polkadot: 'polkadot',
  centrifugePara: 'centrifuge',
  sora: 'sora',
  edgeware: 'edgeware',
  chainx: 'chainx',
  calamari: 'calamari',
  kilt: 'spiritnet',
  bifrost: 'bifrost',
  statemine: 'statemine',
  karura: 'karura',
  khala: 'khala',
  moonriver: 'moonriver',
  shiden: 'shiden',
  acala: 'acala',
  astar: 'astar',
  altair: 'altair',
  kintsugi: 'kintsugi',
  quartz: 'quartz',
  litmus: 'litmus',
  robonomics: 'robonomics',
  polkadex: 'polkadex',
  'nodle-polkadot': 'nodle',
  darwinia: 'darwinia',
  'darwinia-crab-parachain': 'crab-parachain',
  'darwinia-crab': 'crab',
  zeitgeist: 'zeitgeist',
  'parallelHeiko': 'parallel-heiko',
  bitCountry: 'pioneer',
  shadow: 'shadow',
  picasso: 'picasso',
  moonbeam: 'moonbeam',
  parallel: 'parallel',
  clover: 'clv',
  basilisk: 'basilisk',
  interlay: 'interlay',
  'hydra-dx': 'hydradx', 
  integritee: 'integritee', 
  phala: 'phala', 
  centrifuge: 'centrifuge', 
  originTrail: 'origintrail', 
  turing: 'turing', 
  nodle: 'nodle'

}

export const resolveSubscanUrl = (network: string, address: string) => {
  const subdomain = subscanSubdomainByChain[network]

  return subdomain ? `https://${subdomain}.subscan.io/account/${address}` : undefined
}

export const statescanBaseUrl = 'https://statemine.statescan.io'

export const resolveStatescanUrl = (address: AnyAccountId) =>
  `${statescanBaseUrl}/account/${address}`

export const resolveStatescanAssetUrl = (assetId: number) => `${statescanBaseUrl}/asset/${assetId}`

export const defaultContributionLink: Record<RelayChain, string> = {
  kusama: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fkusama-rpc.polkadot.io#/parachains/crowdloan',
  polkadot: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc.polkadot.io#/parachains/crowdloan'
}

export type ContributionInfo = {
  contribLink?: string
  refBonus?: string
  details?: React.ReactNode
  rewardPool?: string
}

type ContributionByNetwork = Record<string, ContributionInfo>

export const kusamaContributionInfoByNetwork: ContributionByNetwork = {
  subsocial: {
    rewardPool: '16.5%',
    refBonus: '15 SUB per KSM'
  },
  integritee: {
    contribLink: 'https://crowdloan.integritee.network/',
    rewardPool: '10%'
  },
  bitCountry: {
    contribLink:
      'https://ksmcrowdloan.bit.country/crowdloan?referralCode=EGGt1JS6HhKkSXq9P12BtmXiGwrGHaVxPtRrot8hDewz66Z',
    refBonus: '2.5%',
    rewardPool: '15%'
  },
  quartz: {
    contribLink: 'https://unique.network/quartz/crowdloan/contribute/',
    rewardPool: '8%'
  },
  picasso: {
    details: (
      <ol className={styles.DetailsList}>
        <li>Go to the <ExternalLink url='https://crowdloan.composable.finance/kusama' value='Picasso Contribution page' />.</li>
        <li>Click on the &quot;Connect wallet&quot; button.</li>
        <li>Select your Kusama account address and enter the amount you want to contribute.</li>
        <li>Enter this referral code: <span className={styles.ReferralCode}>{picassoRefCode}</span></li>
        <li>Click on the &quot;Submit&quot; button near the referral code input.</li>
        <li>Click on the &quot;Contribute&quot; button.</li>
      </ol>
    ),
    rewardPool: '25%'
  },
  calamari: {
    rewardPool: '30%'
  },
  altair: {
    rewardPool: '15.8%'
  },
  basilisk: {
    rewardPool: '15%'
  },
  parallel: {
    rewardPool: '15%'
  },
  kilt: {
    rewardPool: '1.55%'
  },
  polkasmith: {
    rewardPool: '15%'
  },
  bifrost: {
    rewardPool: '13.5%'
  },
  genshiro: {
    rewardPool: '12.5%'
  },
  karura: {
    rewardPool: '11%'
  },
  khala: {
    rewardPool: '1.5%'
  },
  kintsugi: {
    rewardPool: '10%'
  },
  moonriver: {
    rewardPool: '30%'
  },
  shiden: {
    rewardPool: '22%'
  },
  shadow: {
    rewardPool: '20%'
  },
  robonomics: {
    rewardPool: '1.08%'
  },
  zeitgeist: {
    contribLink: 'https://crowdloan.zeitgeist.pm/referral=RUdHdDFKUzZIaEtrU1hxOVAxMkJ0bVhpR3dyR0hhVnhQdFJyb3Q4aERld3o2Nlo=',
    refBonus: '5%',
    rewardPool: '12.5%'
  },
//  sakura: {
//    rewardPool: '1.5%'
//  },
  sherpax: {
    rewardPool: '40%'
  },
  mars: {
    rewardPool: '30%'
  },
  mangata: {
    rewardPool: '14%'
  },
  litmus: {
    rewardPool: '1.5%'
  },
  kico: {
    rewardPool: '5%'
  },
  pichiu: {
    rewardPool: '10.5%'
  },
  turing: {
    rewardPool: '16%'
  },
  tanganika: {
    rewardPool: '0.3%'
  },
  invArch: {
    rewardPool: '15%'
  },
  kabocha: {
    rewardPool: '4.98%'
  },
  bajun: {
    rewardPool: '10%'
  },
  imbue: {
    rewardPool: '15%'
  },
  gm: {
    rewardPool: '30%'
  },
  amplitude: {
    rewardPool: '10%'
  }
}

export const polkadotContributionInfoByNetwork: ContributionByNetwork = {
  acala: {
    contribLink:
      'https://acala.network/acala/join-acala?ref=0x4ab52bb8245e545fc6b7861df6cf6a2db175f95c99f6b4b27e8f3bb3e9d10c4b',
    refBonus: '5%',
    rewardPool: '17%'
  },
  moonbeam: {
    contribLink: 'https://crowdloan.moonbeam.foundation/',
    rewardPool: '10%'
  },
  astar: {
    contribLink: 'https://crowdloan.astar.network/?referral=12gxN2DdKhwsSKiuLKEyS6EgRJfG9vKTaWnAdSbXmWTyRFaG',
    rewardPool: '20%',
    refBonus: '1%'
  },
  litentry: {
    rewardPool: '20%'
  },
  parallel: {
    contribLink:
    'https://crowdloan.parallel.fi/#/auction/contribute/polkadot/2012?referral=0x9fe857c39295267fa451e45337fd50658624b01b82f759d1e8843e43c16ed577',
    refBonus: '5%',
    rewardPool: '15%'
  },
  manta: {
    contribLink: 'https://crowdloan.manta.network/?referral=4ab52bb8245e545fc6b7861df6cf6a2db175f95c99f6b4b27e8f3bb3e9d10c4b',
    refBonus: '2.5%',
    rewardPool: '15.6%'
  },
  clover: {
    rewardPool: '20%'
  },
  subdao: {
    rewardPool: '30%'
  },
  darwinia: {
    contribLink: 'https://darwinia.network/plo_contribute?referral=12gxN2DdKhwsSKiuLKEyS6EgRJfG9vKTaWnAdSbXmWTyRFaG',
    refBonus: '5%',
    rewardPool: '9.84%'
  },
  subGame: {
    rewardPool: '6.8%'
  },
  efinity: {
    rewardPool: '10%'
  },
  phala: {
    rewardPool: '10%'
  },
  equilibrium: {
    rewardPool: '20%'
  },
  crust: {
    rewardPool: '5%'
  },
  'hydra-dx': {
    rewardPool: '10%'
  },
  coinversation: {
    rewardPool: '22.5%'
  },
  'nodle-polkadot': {
    rewardPool: '4.05%'
  },
  'polkadex-polkadot': {
    rewardPool: '10%'
  },
  unique: {
    rewardPool: '15%'
  },
  geminis: {
    rewardPool: '15%'
  },
  kylin: {
    rewardPool: '3.33%'
  }
}

export const contributionInfoByRelayChain: Record<RelayChain, ContributionByNetwork> = {
  kusama: kusamaContributionInfoByNetwork,
  polkadot: polkadotContributionInfoByNetwork
}
