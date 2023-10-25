import { isEmptyStr } from '@subsocial/utils'
import { getLinkBrand, getLinkIcon } from './utils'
import { BareProps } from 'src/components/utils/Section'
import Button from '../../tailwind-components/Button'
import { AiOutlineMail } from 'react-icons/ai'
import clsx from 'clsx'

export declare type NamedLink = {
  name: string
  url?: string
}

type SocialLinkProps = BareProps & {
  link: string
  label?: string
}

export const SocialLink = ({ link, label, className }: SocialLinkProps) => {
  if (isEmptyStr(link)) return null

  const brand = getLinkBrand(link)
  return (
    <Button
      variant={'iconLink'}
      size={'noPadding'}
      href={link}
      title={brand}
      rel='noreferrer'
      target='_blank'
      className={clsx(
        className,
        'p-[3px] text-[16px]'
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {getLinkIcon(brand)}
      {label && (
        <>
          <span>{`${label} ${brand}`}</span>
        </>
      )}
    </Button>
  )
}

type SocialLinksProps = {
  links: string[] | NamedLink[]
}

export const ViewSocialLinks = ({ links }: SocialLinksProps) => {
  return (
    <div className='flex items-center gap-2'>
      {(links as string[]).map((link, i) => (
        <SocialLink key={`social-link-${i}`} link={link} />
      ))}
    </div>
  )
}

type ContactInfoProps = SocialLinksProps & {
  email: string
  spaceId?: string
}

export const EmailLink = ({ link, label, className }: SocialLinkProps) => (
  <Button
    className={clsx(
      className, 
      'p-[4px] text-[14px]'
    )}
    size={'noPadding'}
    href={`mailto:${link}`}
    title='Email'
    variant={'iconLink'}
    onClick={(e) => e.stopPropagation()}
  >
    <AiOutlineMail />
    {label && <span className='ml-2'>{`${label} email`}</span>}
  </Button>
)

export const ContactInfo = ({ links, email, spaceId }: Partial<ContactInfoProps>) => {
  if (!links && !email) return null

  return (
    <div className='flex items-center gap-2'>
      {spaceId && <SocialLink key={'social-link-polkaverse'} link={`https://polkaverse.com/${spaceId}`} />}
      {links && <ViewSocialLinks links={links} />}
      {email && <EmailLink link={email} />}
    </div>
  )
}
