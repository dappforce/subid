import { LabelWithIcon } from '@/components/table/balancesTable/utils'
import { PiShareNetworkLight } from 'react-icons/pi'
import SelectbleDropdown, {
  DropdownActionKind,
} from '@/components/utils/Dropdowns/SelectbleDropdown'
import { getIconUrl } from '@/components/utils'

type NetworkSelectorProps = {
  networks: string[]
  setNetworks: (networks: string[]) => void
}

export const networksVariantsWithIconOpt = [
  {
    label: (
      <LabelWithIcon label={'All Networks'} iconSrc={<PiShareNetworkLight />} />
    ),
    key: 'all',
  },
  {
    label: (
      <LabelWithIcon
        label={'Polkadot'}
        iconSize={24}
        iconSrc={getIconUrl('polkadot.svg')}
      />
    ),
    key: 'polkadot',
  },
  {
    label: (
      <LabelWithIcon
        label={'Kusama'}
        iconSize={24}
        iconSrc={getIconUrl('kusama.svg')}
      />
    ),
    key: 'kusama',
  },
  {
    label: (
      <LabelWithIcon
        label={'Astar'}
        iconSize={24}
        iconSrc={getIconUrl('astar.png')}
      />
    ),
    key: 'astar',
  },
]

const NetworkSelector = ({ networks, setNetworks }: NetworkSelectorProps) => {
  const onChange = (values: string[], kind: DropdownActionKind) => {
    const newValue = values.find((x) => !networks.includes(x))

    const isAll = newValue === 'all'

    if (kind === 'select' && values.includes('all') && !isAll) {
      setNetworks(values.filter((x) => x !== 'all'))
    } else if (kind === 'select' && isAll) {
      setNetworks(['all'])
    } else if (kind === 'deselect' && values.length < 1) {
      setNetworks(['all'])
    } else {
      setNetworks(values)
    }
  }

  return (
    <>
      <SelectbleDropdown
        menu={networksVariantsWithIconOpt}
        defaultValue={networks[0]}
        onChange={onChange}
        values={networks}
        label={
          <LabelWithIcon label={'Networks'} iconSrc={<PiShareNetworkLight />} />
        }
      />
    </>
  )
}

export default NetworkSelector
