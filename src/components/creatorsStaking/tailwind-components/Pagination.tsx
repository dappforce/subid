import clsx from 'clsx'
import React from 'react'
import { PiArrowRight, PiArrowLeft } from 'react-icons/pi'

type PaginationProps = {
  className?: string
  defaultCurrent?: number
  current?: number
  total: number
  pageSize: number
  hideOnSinglePage?: boolean
  onChange?: (page: number) => void
}

const Pagination = ({
  className,
  defaultCurrent,
  current,
  total,
  pageSize,
  hideOnSinglePage,
  onChange,
}: PaginationProps) => {
  if (hideOnSinglePage || total <= pageSize) return null

  const pages = Math.ceil(total / pageSize)

  return (
    <div className={clsx('flex items-center justify-center pt-4', className)}>
      <div className='w-full flex items-center justify-between border-t border-[#D4E2EF]'>
        <div 
          onClick={() => current && current !== 1 && onChange?.(current - 1)}
          className='flex items-center pt-[21px] text-text-muted hover:text-text-primary cursor-pointer'
        >
          <PiArrowLeft />
          <p className='text-sm ml-3 mb-0 font-medium leading-none '>
            Previous
          </p>
        </div>
        <div className='sm:flex hidden'>
          {Array.from({ length: pages }, (_, i) => {
            const page = i + 1
            const isCurrentPage = current === page

            return (
              <p
                key={i}
                onClick={() => !isCurrentPage && onChange?.(page)}
                className={clsx(
                  'text-sm font-medium mb-0 leading-none cursor-pointer',
                  'text-text-muted pt-[21px] px-4',
                  {
                    ['hover:text-text-primary border-t-2 border-transparent hover:border-text-primary']:
                      !isCurrentPage,
                    ['!text-text-primary border-t-2 border-text-primary']: isCurrentPage,
                  }
                )}
              >
                {page}
              </p>
            )
          })}
        </div>
        <div 
          onClick={() => current && current !== pages && onChange?.(current + 1)}
          className='flex items-center pt-[21px] text-text-muted hover:text-text-primary cursor-pointer'
        >
          <p className='text-sm font-medium mb-0 leading-none mr-3'>Next</p>
          <PiArrowRight />
        </div>
      </div>
    </div>
  )
}

export default Pagination
