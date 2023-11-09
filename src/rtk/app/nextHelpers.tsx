import {
  GetServerSidePropsContext,
  NextComponentType,
  NextPageContext,
  PreviewData,
} from 'next'
import { AppDispatch, wrapper } from './store'
import { SagaStore } from './saga'
import { RootState } from './rootReducer'
import { END } from '@redux-saga/core'
import { ParsedUrlQuery } from 'querystring'

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
  (component.getInitialProps = wrapper.getInitialPageProps(
    (reduxStore) => async (context) => {
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
    }
  ))

export type NextServerSideProps = {
  context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
  dispatch: AppDispatch
  reduxStore: SagaStore
  state: RootState
}

type Fn<Result extends {}> = (props: NextServerSideProps) => Promise<Result>

export const getServerSidePropsWithRedux = async <ResultProps extends {} = {}>(
  cb?: Fn<ResultProps>
) =>
  wrapper.getServerSideProps((store) => async (context) => {
    let resultProps = {} as ResultProps
    const state = store.getState()

    if (typeof cb === 'function') {
      const { dispatch } = store
      resultProps = await cb({ context, dispatch, reduxStore: store, state })

      if (context.req) {
        dispatch(END)
        await store.sagaTask?.toPromise()
      }
    }

    return {
      props: {
        ...resultProps,
        state,
      },
    }
  })
