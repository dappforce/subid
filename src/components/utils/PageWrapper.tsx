import React, { FC } from 'react'
import Section from './Section'
import clsx from 'clsx'

// TODO Extract this copypaste to SDK or use in monorepo.

type Props = {
  leftPanel?: React.ReactNode
  rightPanel?: React.ReactNode
  level?: number
  title?: React.ReactNode
  sectionClassName?: string
  className?: string
  withOnBoarding?: boolean
  withVoteBanner?: boolean
  children: React.ReactNode
}

export const PageContent: FC<Props> = ({
  level = 1,
  title,
  className,
  sectionClassName,
  children,
}) => {
  return (
    <>
      <section
        className={clsx(
          'DfSectionOuter DfSectionHeight d-flex w-100 bs-p-0',
          sectionClassName
        )}
      >
        <Section sectionClassName={sectionClassName}>
          <Section
            sectionClassName={sectionClassName}
            className={className}
            level={level}
            title={title}
          >
            {children}
          </Section>
        </Section>
      </section>
    </>
  )
}
