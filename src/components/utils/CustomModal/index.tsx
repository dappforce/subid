import { Modal, ModalProps } from 'antd'
import clsx from 'clsx'
import { MutedSpan } from 'src/components/utils/MutedText'
import styles from './index.module.sass'

export interface CustomModalProps extends ModalProps {
  title?: string | JSX.Element
  subtitle?: string | JSX.Element
  footer?: JSX.Element
  contentClassName?: string
  footerClassName?: string
  fullHeight?: boolean
  noScroll?: boolean
}

export default function CustomModal ({
  title,
  subtitle,
  children,
  footer,
  className,
  contentClassName,
  footerClassName,
  fullHeight,
  noScroll,
  ...props
}: CustomModalProps & {
  children: any
}) {
  return (
    <Modal
      footer={null}
      className={clsx(
        styles.CustomModalContainer,
        fullHeight && styles.CustomModalFullHeight,
        className,
      )}
      {...props}
    >
      {(title || subtitle) && (
        <div className='d-flex flex-column w-100 pr-3'>
          <h2 className={clsx(styles.CustomModalTitle)}>{title}</h2>
        </div>
      )}
      <div className={clsx(styles.CustomModalContent, !noScroll && styles.OverflowAuto, 'scrollbar', contentClassName)}>
        {subtitle && <MutedSpan className='pb-3'>{subtitle}</MutedSpan>}
        {children}
      </div>
      {footer && <div className={clsx('mt-4', footerClassName)}>{footer}</div>}
    </Modal>
  )
}
