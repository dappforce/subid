import {
  isEmptyStr,
  nonEmptyArr,
  nonEmptyStr,
  summarize,
} from '@subsocial/utils'
import config from 'src/config'
import { fullUrl, resolveIpfsUrl } from '.'
import Head from 'next/head'

const { metaTags } = config

type HeadMetaProps = {
  forceTitle?: boolean
  title?: string
  desc?: string
  image?: string
  canonical?: string
  externalCanonical?: string
  tags?: string[]
}

// Google typically displays the first 50–60 characters of a title tag.
// If you keep your titles under 60 characters, our research suggests
// that you can expect about 90% of your titles to display properly.
const MAX_TITLE_LEN = 45
const MAX_DESC_LEN = 300

const optimizeTitle = (title?: string) => {
  if (!title || isEmptyStr(title) || title === metaTags.title) {
    return metaTags.title
  }

  const leftPart = summarize(title, { limit: MAX_TITLE_LEN })
  return `${leftPart} - ${metaTags.title}`
}

function HeadMeta (props: HeadMetaProps) {
  const { forceTitle, title, desc, image, tags } = props
  const summary = desc
    ? summarize(desc, { limit: MAX_DESC_LEN })
    : metaTags.desc
  const img = nonEmptyStr(image)
    ? resolveIpfsUrl(image)
    : fullUrl(metaTags.defaultImage)

  const optimizedTitle = forceTitle ? title : optimizeTitle(title)

  return (
    <div>
      <Head>
        <title>{optimizedTitle}</title>
        <meta name='description' content={summary} />
        {nonEmptyArr(tags) && (
          <meta name='keywords' content={tags?.join(', ')} />
        )}

        <meta property='og:site_name' content={metaTags.siteName} />
        <meta property='og:image' content={img} />
        <meta property='og:title' content={optimizedTitle} />
        <meta property='og:description' content={summary} />

        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:site' content={metaTags.siteName} />
        <meta name='twitter:image' content={img} />
        <meta name='twitter:title' content={optimizedTitle} />
        <meta name='twitter:description' content={summary} />
      </Head>
    </div>
  )
}

export default HeadMeta
