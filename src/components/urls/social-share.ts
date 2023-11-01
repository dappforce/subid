import { fullUrl } from '../utils'

type OptionsType = {
  tags?: string[]
  externalBaseUrl?: string
}

export const twitterShareUrl = (
  url: string,
  text?: string,
  options?: OptionsType
) => {
  const tags = options?.tags
  const textVal = text ? `text=${text}` : ''
  const resolvedUrl = fullUrl(url, options?.externalBaseUrl)

  const result = encodeURI(
    `https://twitter.com/intent/tweet?${textVal}&url=${
      resolvedUrl + '\n\n'
    }&hashtags=${[ ...(tags || []) ]}&original_referer=${url}`
  )

  return result.replace(/#/g, '%23')
}
