import { NextComponentType, NextPageContext } from 'next'
import { AppDispatch, wrapper } from './store'
import { SagaStore } from './saga'
import { RootState } from './rootReducer'
import { END } from '@redux-saga/core'

export type NextContextWithRedux = {
  context: NextPageContext
  dispatch: AppDispatch
  reduxStore: SagaStore
  state: RootState
}

type CbFn<Result extends {}> = (props: NextContextWithRedux) => Promise<Result>

export const getInitialPropsWithRedux = async <ResultProps extends {} = {}>(
  component: NextComponentType<NextPageContext, ResultProps, ResultProps>,
  cb?: CbFn<ResultProps>
) =>
  component.getInitialProps = wrapper.getInitialPageProps(reduxStore => async (context) => {
    let resultProps = {} as ResultProps
    const state = reduxStore.getState()

    if (typeof cb === 'function') {
      const { dispatch } = reduxStore
      resultProps = await cb({ context, dispatch, reduxStore, state })

      if (context.req) {
        dispatch(END)
        await reduxStore.sagaTask?.toPromise()
      }
    }

    return {
      ...resultProps,
      state,
    }
  })
