import clsx from 'clsx'
import React, { HTMLProps } from 'react'
import { MutedSpan } from './MutedText'

export type DfCardProps = HTMLProps<HTMLDivElement> & {
  noShadow?: boolean
}

export default function DfCard ({ noShadow, ...props }: DfCardProps) {
  return (
    <div {...props} className={clsx('DfCard', !noShadow && 'WithShadow', props.className)} />
  )
}

export type DfCardSideBySideContentProps = Omit<DfCardProps, 'children' | 'content'> & {
  content: {
    label: string | JSX.Element
    value: string | JSX.Element
    labelClassName?: string
    valueClassName?: string
  }[]
}
export function DfCardSideBySideContent ({ content, ...props }: DfCardSideBySideContentProps) {
  return (
    <DfCard {...props} className={clsx('d-flex flex-column GapSmall', props.className)}>
      {content.map(({ label, value, labelClassName, valueClassName }, idx) => (
        <div className='d-flex justify-content-between' key={idx}>
          <MutedSpan className={labelClassName}>{label}</MutedSpan>
          <span className={clsx('font-weight-semibold', valueClassName)}>{value}</span>
        </div>
      ))}
    </DfCard>
  )
}

