import { InfoCircleFilled } from '@ant-design/icons'
import clsx from 'clsx'
import { HTMLProps } from 'react'
import { MutedSpan } from '../MutedText'
import styles from './index.module.sass'

const alertTypes = {
  info: {
    className: styles.Info,
    icon: <InfoCircleFilled />,
    desktopStyle: { top: '4px' },
  },
  warning: {
    className: styles.Warning,
    icon: <InfoCircleFilled />,
    desktopStyle: { top: '4px' },
  },
}

export interface AlertPanelProps
  extends Omit<HTMLProps<HTMLDivElement>, 'title'> {
  title?: string | JSX.Element
  desc?: string | JSX.Element
  icon?: JSX.Element
  alertType?: keyof typeof alertTypes
  showDefaultIcon?: boolean
  actionButton?: JSX.Element
  alertPanelClassName?: string
}

export default function AlertPanel ({
  title,
  desc,
  icon,
  alertType = 'info',
  showDefaultIcon,
  actionButton,
  alertPanelClassName,
  ...props
}: AlertPanelProps) {
  const alertProps = alertType && alertTypes[alertType]
  const displayedIcon = icon || (showDefaultIcon && alertProps?.icon)

  if (!title && !desc) return null

  return (
    <div className={clsx(styles.Alert, alertProps.className, props.className)}>
      <div {...props} className={clsx(styles.AlertPanel, alertPanelClassName)}>
        {displayedIcon && (
          <div className={styles.Icon} style={alertProps.desktopStyle}>
            {displayedIcon}
          </div>
        )}
        <div className={styles.Content}>
          {title && (
            <span className={styles.Title}>
              <span className={styles.MobileIcon}>{icon}</span>
              {title}
            </span>
          )}
          {desc && title ? (
            <MutedSpan className={styles.Desc}>{desc}</MutedSpan>
          ) : (
            <span className={styles.Desc}>{desc}</span>
          )}
        </div>
      </div>
      {actionButton}
    </div>
  )
}
