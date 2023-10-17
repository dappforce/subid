import clsx from 'clsx'
import { ChangeEvent } from 'react'

type CheckboxProps = {
  label: React.ReactNode
  defaultValue?: boolean
  value: boolean
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  className?: string
  labelClassName?: string
}

const Checkbox = ({
  label,
  defaultValue = false,
  value,
  onChange,
  className,
  labelClassName,
}: CheckboxProps) => {
  return (
    <div className='flex items-start'>
      <input
        id='default-checkbox'
        type='checkbox'
        className={clsx(
          'w-4 h-4 text-text-primary bg-gray-100 mt-[2px]',
          'border-gray-300 rounded',
          className
        )}
        defaultChecked={defaultValue}
        onChange={onChange}
        checked={value}
      />
      <label className={clsx('ml-2 text-sm font-medium', labelClassName)}>
        {label}
      </label>
    </div>
  )
}

export default Checkbox
