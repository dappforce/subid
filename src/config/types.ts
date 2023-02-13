export type AppConfig = {
  appName: string
  appLogo: string
  mobileAppLogo: string
  appBaseUrl: string
  themeName?: string
  metaTags: {
    siteName: string
    title: string
    desc: string
    defaultImage: string
  }
  canonicalUrl: string
  supportedCollectionNames: string[]
  collectionId: string
}
