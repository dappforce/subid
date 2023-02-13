import rootReducer, { RootState } from './rootReducer'
import { devMode } from '../../config/env'
import createSagaMiddleware from 'redux-saga'
import rootSaga from './saga'
import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, createSelectorHook } from 'react-redux'
import { SagaStore } from './saga'
import { createWrapper } from 'next-redux-wrapper'

export type AppStore = typeof emptyStore

let store: AppStore | undefined

export type AppDispatch = typeof emptyStore.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()

export const useAppSelector = createSelectorHook<RootState>()

function initStore (preloadedState?: RootState) {
  const sagaMiddleware = createSagaMiddleware()

  const store: SagaStore = configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: [ sagaMiddleware ],
  })

  store.sagaTask = sagaMiddleware.run(rootSaga)

  return store
}

const emptyStore = initStore()

export const initializeStore = () => {
  let _store = store ?? initStore()

  if (store) {
    _store = initStore()
    store = undefined
  }

  if (typeof window === 'undefined') return _store

  if (!store) store = _store

  if (devMode && (module as any).hot && store) {
    (module as any).hot.accept('./rootReducer', () => {
      const newRootReducer = require('./rootReducer').default
      store && store.replaceReducer(newRootReducer)
    })
  }

  return _store
}

export const wrapper = createWrapper(initializeStore)
