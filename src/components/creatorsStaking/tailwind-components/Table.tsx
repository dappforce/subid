import clsx from 'clsx'

export type Column = {
  index: string
  name: string
  align?: 'left' | 'center' | 'right'
}

type TableProps = {
  columns: Column[]
  data: any[]
}

const Table = ({ columns, data }: TableProps) => {
  return (
    <div className='relative overflow-x-auto'>
      <table className='w-full text-left'>
        <thead className='text-text-muted bg-gray-50 text-base'>
          <tr>
            {columns.map(({ name, index, align }, i) => (
              <th
                key={index}
                scope='col'
                className={clsx(
                  'py-4 px-6 font-normal',
                  `text-${align || 'left'}`,
                  {
                    ['rounded-s-2xl']: i === 0,
                    ['rounded-e-2xl']: i === columns.length - 1,
                  }
                )}
              >
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => {
            return (
              <tr
                key={i}
                className={clsx('border-b border-[#D4E2EF]', {
                  ['border-none']: i === data.length - 1,
                })}
              >
                {columns.map(({ index, align }, j) => {
                  const value = item[index]

                  return (
                    <td
                      key={`${index}-${j}`}
                      className={clsx('px-6 py-4', `text-${align || 'left'}`)}
                    >
                      {value}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Table
