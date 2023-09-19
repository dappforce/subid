import { isEmptyStr } from '@subsocial/utils'

import { 
  BiLogoFacebookCircle, 
  BiLogoTwitter,
  BiLogoLinkedin,
  BiLogoGithub,
  BiLogoInstagram,
  BiLogoYoutube,
  BiLogoTelegram
} from 'react-icons/bi'

import { AiOutlineGlobal, AiFillMediumCircle } from 'react-icons/ai'

type SocialBrand =
  | 'Facebook'
  | 'Twitter'
  | 'Medium'
  | 'LinkedIn'
  | 'GitHub'
  | 'Instagram'
  | 'YouTube'
  | 'Telegram'

export type LinkLabel = SocialBrand | 'Website'

const brandsWithProfiles: SocialBrand[] = [
  'Facebook',
  'Twitter',
  'Medium',
  'LinkedIn',
  'GitHub',
  'Instagram',
  'YouTube',
]

export const hasSocialMediaProfiles = (brand: LinkLabel): boolean => {
  return brandsWithProfiles.indexOf(brand as SocialBrand) >= 0
}

export const getLinkIcon = (brand?: LinkLabel, className?: string) => {
  switch (brand) {
    case 'Facebook':
      return <BiLogoFacebookCircle className={className} />
    case 'Twitter':
      return <BiLogoTwitter className={className} />
    case 'Medium':
      return <AiFillMediumCircle className={className} />
    case 'LinkedIn':
      return <BiLogoLinkedin className={className} />
    case 'GitHub':
      return <BiLogoGithub className={className} />
    case 'Instagram':
      return <BiLogoInstagram className={className} />
    case 'YouTube':
      return <BiLogoYoutube className={className} />
    case 'Telegram':
      return <BiLogoTelegram className={className} />
    case 'Website':
      return <AiOutlineGlobal className={className} />
    default:
      return <AiOutlineGlobal className={className} />
  }
}

const linkPrefix = '^(https?://)?([a-z0-9-]+.)?'

const newSocialLinkRegExp = (brandDomain: string): RegExp => {
  return new RegExp(linkPrefix + brandDomain)
}

const socialLinksRegExp: Record<SocialBrand, RegExp[]> = {
  Facebook: [
    newSocialLinkRegExp('facebook.com'),
    newSocialLinkRegExp('fb.me'),
    newSocialLinkRegExp('fb.com'),
    newSocialLinkRegExp('facebook.me'),
  ],
  Twitter: [ newSocialLinkRegExp('twitter.com') ],
  Medium: [ newSocialLinkRegExp('medium.com') ],
  LinkedIn: [ newSocialLinkRegExp('linkedin.com'), newSocialLinkRegExp('linked.in') ],
  GitHub: [ newSocialLinkRegExp('github.com') ],
  Instagram: [ newSocialLinkRegExp('instagram.com'), newSocialLinkRegExp('instagr.am') ],
  YouTube: [ newSocialLinkRegExp('youtube.com'), newSocialLinkRegExp('youtu.be') ],
  Telegram: [ newSocialLinkRegExp('t.me'), newSocialLinkRegExp('telegram.me') ],
}

const isSocialBrandLink = (brand: SocialBrand, link: string): boolean => {
  if (isEmptyStr(link)) {
    return false
  }

  link = link.trim().toLowerCase()
  return !!socialLinksRegExp[brand].find(r => r.test(link))
}

export const getLinkBrand = (link: string): LinkLabel | undefined => {
  for (const key in socialLinksRegExp) {
    const brand = key as SocialBrand
    if (isSocialBrandLink(brand, link)) {
      return brand
    }
  }
  return 'Website'
}
