import clsx from 'clsx'
import React from 'react'
import { useIsMobileWidthOrDevice } from 'src/components/responsive'
import { MutedDiv } from 'src/components/utils/MutedText'

export type CardAdditionalViewProps = {
  data?: { icon?: React.ReactNode; label: string | React.ReactNode; value: React.ReactNode }[]
  custom?: React.ReactNode
}

export default function CardAdditionalView ({ data, custom }: CardAdditionalViewProps) {
  const isMobile = useIsMobileWidthOrDevice()
  return (
    <div className='d-flex flex-column' onClick={(e) => e.stopPropagation()}>
      <Divider className='bs-mt-2 bs-mb-2' />
      <div className={clsx('d-flex flex-column GapMini', isMobile && 'bs-mb-3')}>
        {data?.map(({ label, value }, idx) => (
          <div key={idx} className='d-flex align-items-start justify-content-between'>
            <MutedDiv>
              {label}
            </MutedDiv>
            <div className='text-right'>
              {value}
            </div>
          </div>
        ))}
        {custom}
      </div>
    </div>
  )
}
