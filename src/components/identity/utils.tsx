import { isEmptyStr } from '@subsocial/utils'
import { InfoKeys } from './types'

type LinkProps = {
  url: string
  value: React.ReactNode
  className?: string
}

export const ExternalLink = ({ url, value, className }: LinkProps) =>
  <a className={className} href={url} target='_blank' rel='noreferrer'>{value}</a>

export const getKusamaItem = (key: InfoKeys, value: string) => {
  if (isEmptyStr(value)) return undefined

  switch (key) {
    case 'email': return <ExternalLink url={`mailto:${value}`} value={value} />
    case 'twitter': return <ExternalLink url={`https://twitter.com/${value.replace('@', '')}`} value={value} />
    case 'web': return <ExternalLink url={`https://${value}`} value={value} />
    case 'riot': return <ExternalLink url={`https://matrix.to/#/${value}`} value={value} />
    default: return value
  }
}
