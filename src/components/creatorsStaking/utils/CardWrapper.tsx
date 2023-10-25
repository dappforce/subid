import clsx from 'clsx'
import { ComponentProps } from 'react'

type CardWrapperProps = ComponentProps<'div'>

const CardWrapper = ({ children, className, ...props }: CardWrapperProps) => {
  return (
    <div
      className={clsx(
        'w-full',
        'flex flex-col gap-2 md:px-6 px-4 !py-4 rounded-2xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default CardWrapper