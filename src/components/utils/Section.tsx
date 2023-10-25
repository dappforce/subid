import clsx from 'clsx'
import React, { CSSProperties } from 'react'

export type BareProps = {
  className?: string
  style?: CSSProperties
}

type Props = React.PropsWithChildren<
  BareProps & {
    id?: string
    className?: string
    sectionClassName?: string
    title?: React.ReactNode
    level?: number
  }
>

export const Section = ({
  title,
  level = 2,
  className,
  id,
  children,
  sectionClassName,
}: Props) => {
  const renderTitle = () => {
    if (!title) return null

    const className = 'DfSection-title'
    return React.createElement(`h${level}`, { className }, title)
  }

  return (
    <div className={clsx('DfSectionOuter', sectionClassName)}>
      <section id={id} className={`DfSection ${className}`}>
        {renderTitle()}
        {children}
      </section>
    </div>
  )
}

export default Section
