import { NextPageContext } from 'next'

const Health = () => null

export async function getServerSideProps (context: NextPageContext) {
  context.res?.end('Sub.Id frontend is live')

  return {}
}

export default Health