/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { writeFileSync } = require('fs')

require('dotenv').config()

const varsToExport = [
  'BACKEND_URL',
  'IPFS_URL',
  'DEV_MODE',
  'GA_ID',
  'GRILLCHAT_URL'
]

function getSerializedVal (varName) {
  const val = process.env[varName]
  return typeof val === 'string' ? `'${val}'` : val
}

const vals = varsToExport
  .map(varName => `${varName}: ${getSerializedVal(varName)}`)
  .join(',\n  ')

const jsFile = `${__dirname}/public/env.js`

console.log(`Export .env to ${jsFile}`)
writeFileSync(jsFile,
  `// WARN: This is a generated file. Do not modify!

if (!window.process) window.process = {};
if (!window.process.ENV) window.process.ENV = {};

process.env = {
  ${vals}
};
`, 'utf8'
)
