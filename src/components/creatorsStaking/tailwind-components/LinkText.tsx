import { cva, VariantProps } from 'class-variance-authority'
import clsx from 'clsx'
import Link, { LinkProps } from 'next/link'
import { ComponentProps, forwardRef } from 'react'
import { HiArrowUpRight } from 'react-icons/hi2'

export const linkTextStyles = cva(
  'font-medium cursor-pointer hover:underline focus-visible:underline',
  {
    variants: {
      variant: {
        primary: 'text-text-primary hover:text-text-primary hover:no-underline',
        secondary: 'text-text-secondary',
        default: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export type LinkTextProps = Omit<ComponentProps<'a'>, 'href'> &
  VariantProps<typeof linkTextStyles> & {
    href: LinkProps['href']
    openInNewTab?: boolean
    withArrow?: boolean
    arrowClassName?: string
  }

const LinkText = forwardRef<any, LinkTextProps>(function LinkText (
  { href, variant, openInNewTab, withArrow, arrowClassName, ...props },
  ref
) {
  let anchorProps = {}
  if (openInNewTab) {
    anchorProps = {
      target: '_blank',
      rel: 'noopener noreferrer',
    }
  }

  return (
    <Link href={href} passHref legacyBehavior>
      <a
        {...props}
        {...anchorProps}
        ref={ref}
        className={clsx(linkTextStyles({ variant }), props.className)}
      >
        {props.children}
        {withArrow && (
          <HiArrowUpRight
            className={clsx(
              'relative -top-px ml-1 inline text-sm',
              arrowClassName
            )}
          />
        )}
      </a>
    </Link>
  )
})

export default LinkText
