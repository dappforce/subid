import { ComponentProps, forwardRef } from 'react'
import FieldWrapper, {
  getCleanedInputProps,
  RequiredFieldWrapperProps,
} from './common/FieldWrapper'
import clsx from 'clsx'

export type InputProps = Omit<ComponentProps<'input'>, 'size'> &
  RequiredFieldWrapperProps

const Input = forwardRef<HTMLInputElement, InputProps>(function Input (
  props: InputProps,
  ref
) {
  return (
    <FieldWrapper {...props}>
      {(commonClassNames) => (
        <input
          {...getCleanedInputProps(props)}
          ref={ref}
          className={clsx(commonClassNames, props?.className)}
        />
      )}
    </FieldWrapper>
  )
})
export default Input
