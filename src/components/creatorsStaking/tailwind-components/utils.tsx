import { cva } from 'class-variance-authority'
import clsx from 'clsx'

export const interactionRingStyles = cva(
  clsx(
    'disabled:hover:ring-0 disabled:ring-offset-0 hover:ring-1',
    'focus-visible:ring-1 hover:ring-[#3482f680]',
    'focus-visible:ring-[#3482f680] focus-visible:outline-none'
  ),
  {
    variants: {},
    defaultVariants: {},
  }
)
