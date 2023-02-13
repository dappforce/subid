import { AppConfig } from '../types'

const appConfig: AppConfig = {
  appName: 'Sub.ID',
  appBaseUrl: 'https://sub.id',
  appLogo: '/images/SubID-logo.svg',
  mobileAppLogo: '/images/SubID-logo-mobile.svg',
  metaTags: {
    siteName: 'Sub.ID',
    title: 'Sub ID: Substrate Addresses, Balances, Crowdloans and NFTs',
    desc:  'Wallet info for your favorite Dotsama cryptocurrencies like Polkadot ($DOT), Kusama ($KSM), Acala ($ACA), Karura ($KAR), Moonbeam ($GLMR), Shiden ($SDN), Subsocial ($SUB), and other chains in the ecosystem.',
    defaultImage: '/images/sub-id-site-preview.png'
  },
  canonicalUrl: 'https://sub.id',
  supportedCollectionNames: [
    'WHY-NOT-SUB',
    'SUB-CL-2',
    'SUB-CL-1',
    'SUBBANNER',
    'PARACHAINS-ARE-SEXY-SUBBANNERS',
    'MOUSE-DAO-SUBBANNERS'
  ],
  collectionId: '24d6d7cd9a97d46d3e'
}

export default appConfig