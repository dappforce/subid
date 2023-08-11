import clsx from 'clsx'
import { PolymorphicProps, PolymorphicTypes, generatePolymorphicComponent } from './generator/polymorphic'

export type ContainerProps<Type extends PolymorphicTypes> =
  PolymorphicProps<Type>

const Container = generatePolymorphicComponent(
  clsx('relative mx-auto w-full max-w-screen-md px-2')
)
export default Container
