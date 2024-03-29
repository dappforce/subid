import { cva, VariantProps } from 'class-variance-authority'
import Link, { LinkProps } from 'next/link'
import { ComponentProps, forwardRef } from 'react'
import Spinner from './Spinner'
import clsx from 'clsx'
import { interactionRingStyles } from './utils'

export const buttonStyles = cva('relative rounded-full transition leading-[22px]', {
  variants: {
    variant: {
      primary:
        'bg-background-primary border border-transparent text-text-on-primary',
      primaryOutline:
        'bg-transparent border border-background-primary !text-text-primary',
      whiteOutline: 'bg-transparent border border-white text-text',
      white: 'bg-white text-text hover:text-text',
      mutedOutline: 'bg-transparent border border-text-muted text-text-muted',
      transparent: 'bg-transparent',
      redOutline: 'bg-transparent border border-text-red text-text-red',
      outlined: 'bg-transparent border border-[#D4E2EF]',
      iconLink: 'text-text-primary hover:text-text-primary bg-indigo-50',
      iconLinkGray: 'text-[#64748B] hover:text-text-primary bg-[#F1F5F9]',
      iconPrimary: 'text-text-primary hover:text-text-primary hover:!ring-0',
    },
    disabledStyle: {
      default: '',
      subtle: '',
    },
    disabled: {
      true: '',
    },
    size: {
      noPadding: 'p-0',
      circle: 'p-2',
      sm: 'px-4 py-1',
      md: 'px-6 py-2',
      lg: 'px-8 py-3',
    },
    interactive: {
      all: clsx(
        // TODO: find solution why filter makes element move around in safari
        // 'hover:brightness-110 focus:brightness-110',
        interactionRingStyles()
      ),
      'brightness-only': clsx(
        ''
        // 'hover:brightness-110 focus:brightness-110'
      ),
      none: '',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
    interactive: 'all',
    disabledStyle: 'default',
  },
  compoundVariants: [
    {
      disabled: true,
      disabledStyle: 'default',
      class: clsx(
        'opacity-30 dark:brightness-50 dark:opacity-100 pointer-events-none cursor-default'
      ),
    },
    {
      disabled: true,
      disabledStyle: 'subtle',
      class: clsx('opacity-50 pointer-events-none cursor-default'),
    },
  ],
})

type ButtonPropsWithRef = VariantProps<typeof buttonStyles> &
  ComponentProps<'button'> &
  ComponentProps<'a'> & {
    withDisabledStyles?: boolean
    isLoading?: boolean
    loadingText?: string
    nextLinkProps?: Omit<LinkProps, 'href'>
  }
export type ButtonProps = Omit<ButtonPropsWithRef, 'ref'>

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button (
  {
    variant,
    href,
    size,
    disabled: _disabled,
    withDisabledStyles = true,
    interactive,
    isLoading,
    children,
    nextLinkProps,
    loadingText = 'Loading',
    disabledStyle,
    type = 'button',
    ...props
  },
  ref
) {
  const disabled = _disabled || isLoading
  if (isLoading) {
    children = (
      <>
        <span className='invisible -z-10 opacity-0'>{children}</span>
        <div className='absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center'>
          <span className='mr-2'>{loadingText}</span>{' '}
          <Spinner className='h-4 w-4' />
        </div>
      </>
    )
  }

  const className = clsx(
    buttonStyles({
      variant,
      size,
      disabled: disabled && withDisabledStyles,
      interactive,
      disabledStyle,
    }),
    'inline-block text-center',
    props.className
  )

  if (href) {
    return (
      <Link {...nextLinkProps} href={href} passHref legacyBehavior>
        <a ref={ref as any} {...props} className={className}>
          {children}
        </a>
      </Link>
    )
  }

  return (
    <button
      ref={ref}
      {...props}
      type={type}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  )
})
export default Button
