import React from 'react'
import { Empty } from 'antd'
import { MutedSpan } from './MutedText'

type Props = React.PropsWithChildren<{
  style?: React.CSSProperties
  image?: React.ReactNode
  description?: React.ReactNode
}>

export const NoData = (props: Props) => (
  <Empty
    className='DfEmpty h-100 d-flex align-items-center justify-content-center flex-sm-column'
    style={props.style}
    image={props.image}
    description={
      <MutedSpan>{props.description}</MutedSpan>
    }
  >
    {props.children}
  </Empty>
)

export default NoData
