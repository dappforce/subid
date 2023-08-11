import clsx from 'clsx'
import {
  ComponentProps,
  forwardRef as _forwardRef,
  JSXElementConstructor,
} from 'react'

export type PolymorphicTypes = React.ElementType | JSXElementConstructor<any>
export type PolymorphicProps<Type extends PolymorphicTypes> = {
  as?: Type
} & Omit<ComponentProps<Type>, 'as'>

export function generatePolymorphicComponent<AdditionalProps>(
  defaultClassName: string,
  customRenderer?: (props: AdditionalProps) => JSX.Element
) {
  const forwardRef = _forwardRef as unknown as <
    TypeInner extends PolymorphicTypes
  >(
    render: (
      {
        as,
        ...props
      }: { as?: TypeInner } & Omit<ComponentProps<TypeInner>, 'as'>,
      ref: any
    ) => JSX.Element
  ) => <Type extends PolymorphicTypes>({
    as,
    ...props
  }: { as?: Type } & Omit<ComponentProps<Type>, 'as'>) => JSX.Element

  return forwardRef(function PolymorphicComponent<
    Type extends PolymorphicTypes
  >(
    { className, as, ...props }: PolymorphicProps<Type> & AdditionalProps,
    ref: any
  ) {
    const Component = as || 'div'

    if (customRenderer) {
      return customRenderer(props as AdditionalProps)
    }

    return (
      <Component
        {...props}
        ref={ref}
        className={clsx(defaultClassName, className)}
      />
    )
  })
}
