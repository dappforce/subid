import { backendUrl } from 'src/config/env'
import { AxiosResponse } from 'axios'

export function getBackendUrl (subUrl: string): string {
  return `${backendUrl}/api/v1/${subUrl}`
}

type SendRequestProps = {
  request: () => Promise<AxiosResponse<any, any>>
  onFaileReturnedValue: any
  onFailedText: string
}

export const sendRequest = async ({ request, onFaileReturnedValue, onFailedText }: SendRequestProps) => {
  try {
    const res = await request()
    if (res.status !== 200) {
      console.warn(onFailedText)
    }

    return res.data
  } catch (err) {
    console.error(onFailedText, err)
    return onFaileReturnedValue
  }
}