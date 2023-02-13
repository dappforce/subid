import { fullUrl } from '../utils'

const SUBID_TAGS = Array.from(new Set([ 'SubID' ]))

type OptionsType = {
  tags?: string[]
  externalBaseUrl?: string
}

export const twitterShareUrl = (url: string, text?: string, options?: OptionsType) => {
  const tags = options?.tags
  const textVal = text ? `text=${text}` : ''
  const resolvedUrl = fullUrl(url, options?.externalBaseUrl)

  return encodeURI(
    `https://twitter.com/intent/tweet?${textVal}&url=${resolvedUrl + '\n\n'}&hashtags=${[
      SUBID_TAGS,
      ...(tags || []),
    ]}&original_referer=${url}`,
  )
}
