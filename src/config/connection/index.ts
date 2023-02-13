import { devMode } from '../env'
import local from './local'
import main from './main'

const connection = devMode ? local : main

export default connection
