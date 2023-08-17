import { ComponentProps } from 'react'
import { linkTextStyles } from './LinkText'
import clsx from 'clsx'

export type TruncatedTextProps = ComponentProps<'div'> & {
  text: string
  textLength?: number
  onButtonClick?: () => void
}

export default function TruncatedText ({
  text,
  textLength = 74,
  onButtonClick,
  ...props
}: TruncatedTextProps) {

  const isClamping = text.split('').length > textLength

  const textSlice = text.slice(0, textLength)

  return (
    <div {...props} className='inline'>
      <span>{textSlice}{isClamping && '...'} </span>
      {isClamping && (
        <span
          onClick={onButtonClick}
          className={clsx(
            linkTextStyles({ variant: 'primary' }),
            'mt-0.5 text-sm'
          )}
        >
          Show more
        </span>
      )}
    </div>
  )
}
