export const backendUrl = getEnv('BACKEND_URL') || 'http://localhost:3001'

export const devMode = getEnvAsBool('DEV_MODE') || false

export const gaId = getEnv('GA_ID') || ''

export const subAppBaseUrl = 'https://polkaverse.com'

function getEnv (varName: string): string | undefined {
  const { env } = process
  return env[varName]
}

export function getEnvAsBool (varName: string): boolean | undefined {
  const val = getEnv(varName)?.toString()?.toLowerCase()
  if (val === 'true') return true
  if (val === 'false') return false
  return undefined
}
