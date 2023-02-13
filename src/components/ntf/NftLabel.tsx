import clsx from 'clsx'
import { CONTENT_TYPES } from 'src/types'
import styles from './NftsLayout.module.sass'

export type NftLabelProps = {
  contentType: CONTENT_TYPES
}

const NftLabel = ({ contentType }: NftLabelProps) => {
  const type = contentType === CONTENT_TYPES.unknown ? CONTENT_TYPES.image : contentType

  return <div className={clsx(styles.Label, styles[type === '3d' ? 'model' : type])}>
    <span className={styles.LabelText}>{type}</span>
  </div>
}

export default NftLabel
