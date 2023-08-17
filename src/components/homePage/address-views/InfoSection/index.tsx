import React from 'react'
import { Descriptions as AntdDesc, Row, Col } from 'antd'
import { BareProps } from '../../../utils/Section'
import styles from './index.module.sass'
import { useResponsiveSize } from '../../../responsive/ResponsiveContext'
import { MutedDiv } from '../../../utils/MutedText'

export type DescItem = {
  label?: React.ReactNode
  value: React.ReactNode
}

export type InfoPanelProps = BareProps & {
  title?: React.ReactNode
  items?: DescItem[]
  size?: 'middle' | 'small' | 'default'
  column?: number
  layout?: 'vertical' | 'horizontal'
}

export const InfoPanel = ({ title, size = 'small', layout = 'vertical', column = 2, items, ...bareProps }: InfoPanelProps) => {
  const { isMobile } = useResponsiveSize()

  return !isMobile ? <AntdDesc
    {...bareProps}
    title={title}
    size={size}
    layout={layout}
    column={column}
  >
    {items?.map(({ label, value }, key) => (
      <AntdDesc.Item
        className={`py-0 ${styles.DfInfoSection}`}
        key={key}
        label={label}
      >
        <div className='bs-mb-3'>{value}</div>
      </AntdDesc.Item>
    ))}
  </AntdDesc> :
    <Row>
      {items?.map(({ label, value }, key) => (
        <>
          <Col key={key} span={6} >
            <MutedDiv className='bs-mb-2'>{label}:</MutedDiv>
          </Col>
          <Col key={key} span={18}>
            <div>{value}</div>
          </Col>
        </>
      ))}
    </Row>
}
