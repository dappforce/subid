import React from 'react'
import styles from './Footer.module.sass'
import { useResponsiveSize } from '../responsive'
import { FaTelegramPlane, FaTwitter, FaDiscord, FaBullhorn } from 'react-icons/fa'
import { SubIcon } from 'src/components/utils'
import { ExternalLink } from '../identity/utils'
import { MutedDiv } from '../utils/MutedText'
import clsx from 'clsx'

const socialLinkIcon = styles.SocialLinkIcon

type SocialLink = {
  icon: React.ReactNode
  link: string
  linkName: string
}

type Link = {
  linkName: string
  link: string
}

export type FooterLink = {
  [key: string]: Link[]
}

const socialLinks: SocialLink[] = [
  {
    icon: <SubIcon className={socialLinkIcon} Icon={FaTwitter} />,
    linkName: 'Subsocial Twitter',
    link: 'https://twitter.com/subsocialchain'
  },
  {
    icon: <SubIcon className={socialLinkIcon} Icon={FaDiscord} />,
    linkName: 'Subsocial Discord',
    link: 'https://discord.gg/yU8tgHN'
  },
  {
    icon: <SubIcon className={socialLinkIcon} Icon={FaTelegramPlane} />,
    linkName: 'Subsocial Telegram Chat',
    link: 'https://t.me/Subsocial'
  },
  {
    icon: <SubIcon className={socialLinkIcon} Icon={FaBullhorn} />,
    linkName: 'Subsocial Announcements',
    link: 'https://t.me/SubsocialNetwork'
  }
]

const footerLinks: FooterLink = {
  Basic: [
    {
      linkName: 'Subsocial',
      link: 'https://subsocial.network'
    },
    {
      linkName: 'Privacy Policy',
      link: 'https://subsocial.network/legal/privacy'
    },
    {
      linkName: 'Terms of Use',
      link: 'https://subsocial.network/legal/terms'
    },
  ]
}

type FooterProps = {
  className?: string
}

export const Footer = ({ className }: FooterProps) => {
  const { isMobile } = useResponsiveSize()

  const SocialLinks = () => {
    return <ul className={styles.List}>
      {socialLinks.map((value: any, i) => (
        <li key={value.linkName} className={clsx({ ['bs-mr-3']: i !== socialLinks.length - 1, ['mt-2']: !isMobile }, styles.LinkIcon)}>
          <ExternalLink url={value.link} value={value.icon} />
        </li>
      ))}
    </ul>
  }

  const BasicLinks = () => {
    return <ul className={styles.List}>
      {footerLinks.Basic.map((value: any, i) => (
        <li key={value.linkName} className={clsx({ ['bs-mr-3']: i !== footerLinks.Basic.length - 1 }, 'mt-1')}>
          <MutedDiv><ExternalLink url={value.link} value={value.linkName} /></MutedDiv>
        </li>
      ))}
    </ul>
  }

  return (
    <div className={clsx(styles.Footer, className)}>
      <div className={styles.FooterContent}>
        <div className='d-flex align-items-center'>
          <img src='/images/SubID-logo.svg' alt='SubID' className={styles.Logo} />
          {!isMobile && <BasicLinks />}
        </div>
        <div className={styles.SocialHandles}>
          <SocialLinks />
        </div>
      </div>
      <div className={styles.FooterLinks}>
        {isMobile && <BasicLinks />}
      </div>
    </div>
  )
}

export default Footer
