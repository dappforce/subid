import clsx from 'clsx'
import { HTMLProps } from 'react'
import { MutedSpan } from './MutedText'
import { useTranslation } from 'react-i18next'

export type LoadingTransactionProps = Omit<HTMLProps<HTMLDivElement>, 'summary'> & {
  summary?: string | JSX.Element
}

export default function LoadingTransaction ({ className, summary, ...props }: LoadingTransactionProps) {
  const { t } = useTranslation()
  return (
    <div
      className={clsx(
        'd-flex flex-column',
        'align-items-center justify-content-center',
        className,
      )}
      {...props}
    >
      <img className='on-boarding-image' src='/images/loading.gif' />
      {summary && <span className='mt-4'>{summary}</span>}
      <MutedSpan className={summary ? 'mt-1' : 'mt-4'}>{t('loading.transaction')}</MutedSpan>
    </div>
  )
}
